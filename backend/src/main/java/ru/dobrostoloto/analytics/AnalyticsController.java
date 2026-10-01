package ru.dobrostoloto.analytics;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.history.Participation;
import ru.dobrostoloto.history.ParticipationRepository;
import ru.dobrostoloto.task.TaskRepository;
import ru.dobrostoloto.user.User;
import ru.dobrostoloto.user.UserRepository;

@RestController
public class AnalyticsController {

    public record Stats(
            Integer volunteers,
            Integer foundations,
            Integer completedTasks,
            Integer hours,
            Integer publishedTasks,
            Integer totalResponses
    ) {
    }

    public record Bar(String month, int value) {
    }

    public record Category(String label, int value) {
    }

    public record AnalyticsDto(Stats stats, List<Bar> bars, List<Category> categories) {
    }

    private static final String[] MONTH_RU = {
            "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
            "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
    };

    private static final DateTimeFormatter YEAR_MONTH = DateTimeFormatter.ofPattern("yyyy-MM");

    private final UserRepository users;
    private final TaskRepository tasks;
    private final ParticipationRepository participations;
    private final CurrentUser currentUser;

    public AnalyticsController(UserRepository users, TaskRepository tasks, ParticipationRepository participations, CurrentUser currentUser) {
        this.users = users;
        this.tasks = tasks;
        this.participations = participations;
        this.currentUser = currentUser;
    }

    @GetMapping("/api/analytics")
    @Transactional(readOnly = true)
    public AnalyticsDto analytics(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User current = currentUser.resolve(userId);

        if (User.ROLE_VOLUNTEER.equals(current.role)) {
            return volunteerAnalytics(current);
        }
        if (User.ROLE_FOUNDATION.equals(current.role)) {
            return foundationAnalytics(current);
        }
        return adminAnalytics();
    }

    private AnalyticsDto volunteerAnalytics(User user) {
        List<Participation> mine = participations.findByUserIdOrderByDateDesc(user.id);
        int completed = mine.size();
        int hours = mine.stream().mapToInt(p -> p.hours).sum();

        Map<String, Integer> byMonth = buildMonthMap();
        participations.findSinceForUser(user.id, fiveMonthsAgo()).forEach(p ->
                byMonth.merge(p.date.format(YEAR_MONTH), p.hours, Integer::sum));
        List<Bar> bars = buildBars(byMonth);
        List<Category> categories = buildCategories(mine);

        Stats stats = new Stats(null, null, completed, hours, null, null);
        return new AnalyticsDto(stats, bars, categories);
    }

    private AnalyticsDto foundationAnalytics(User user) {
        String organizer = user.fullName;
        List<Participation> mine = participations.findByOrganizer(organizer);

        int completed = mine.size();
        int hours = mine.stream().mapToInt(p -> p.hours).sum();
        long publishedCount = tasks.findAll().stream()
                .filter(t -> organizer.equals(t.organizer) && "published".equals(t.adminStatus))
                .count();
        int responses = tasks.findAll().stream()
                .filter(t -> organizer.equals(t.organizer))
                .mapToInt(t -> t.responses)
                .sum();

        Map<String, Integer> byMonth = buildMonthMap();
        participations.findSinceForOrganizer(organizer, fiveMonthsAgo()).forEach(p ->
                byMonth.merge(p.date.format(YEAR_MONTH), p.hours, Integer::sum));
        List<Bar> bars = buildBars(byMonth);
        List<Category> categories = buildCategories(mine);

        Stats stats = new Stats(null, null, completed, hours, (int) publishedCount, responses);
        return new AnalyticsDto(stats, bars, categories);
    }

    private AnalyticsDto adminAnalytics() {
        List<Participation> all = participations.findAll();

        int volunteers = (int) users.findAll().stream()
                .filter(u -> User.ROLE_VOLUNTEER.equals(u.role))
                .count();
        int foundations = (int) users.findAll().stream()
                .filter(u -> User.ROLE_FOUNDATION.equals(u.role))
                .count();
        int hours = all.stream().mapToInt(p -> p.hours).sum();
        long publishedCount = tasks.findAll().stream()
                .filter(t -> "published".equals(t.adminStatus))
                .count();
        int responses = tasks.findAll().stream().mapToInt(t -> t.responses).sum();

        Stats stats = new Stats(volunteers, foundations, all.size(), hours, (int) publishedCount, responses);

        Map<String, Integer> byMonth = buildMonthMap();
        participations.findSince(fiveMonthsAgo()).forEach(p ->
                byMonth.merge(p.date.format(YEAR_MONTH), p.hours, Integer::sum));
        List<Bar> bars = buildBars(byMonth);
        List<Category> categories = buildCategories(all);

        return new AnalyticsDto(stats, bars, categories);
    }

    private static LocalDate fiveMonthsAgo() {
        return LocalDate.now().minusMonths(4).withDayOfMonth(1);
    }

    private static Map<String, Integer> buildMonthMap() {
        LocalDate now = LocalDate.now();
        LocalDate from = fiveMonthsAgo();
        Map<String, Integer> byMonth = new LinkedHashMap<>();
        LocalDate cursor = from;
        while (!cursor.isAfter(now)) {
            byMonth.put(cursor.format(YEAR_MONTH), 0);
            cursor = cursor.plusMonths(1);
        }
        return byMonth;
    }

    private static List<Bar> buildBars(Map<String, Integer> byMonth) {
        return byMonth.entrySet().stream()
                .map(e -> new Bar(monthLabel(e.getKey()), e.getValue()))
                .toList();
    }

    private static List<Category> buildCategories(List<Participation> participations) {
        Map<String, Integer> byCategory = new TreeMap<>();
        participations.forEach(p -> byCategory.merge(p.task.category, 1, Integer::sum));
        int total = participations.isEmpty() ? 1 : participations.size();
        List<Category> categories = new ArrayList<>();
        int sumPercent = 0;
        var it = byCategory.entrySet().iterator();
        while (it.hasNext()) {
            var e = it.next();
            int percent;
            if (it.hasNext()) {
                percent = Math.round(e.getValue() * 100f / total);
                sumPercent += percent;
            } else {
                percent = Math.max(0, 100 - sumPercent);
            }
            categories.add(new Category(e.getKey(), percent));
        }
        return categories;
    }

    private static String monthLabel(String yearMonth) {
        LocalDate date = LocalDate.parse(yearMonth + "-01");
        return MONTH_RU[date.getMonthValue() - 1];
    }
}
