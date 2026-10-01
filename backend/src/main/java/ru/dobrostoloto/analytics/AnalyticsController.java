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
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.history.Participation;
import ru.dobrostoloto.history.ParticipationRepository;
import ru.dobrostoloto.user.User;
import ru.dobrostoloto.user.UserRepository;

@RestController
public class AnalyticsController {

    public record Stats(int volunteers, int completedTasks, int hours) {
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
    private final ParticipationRepository participations;

    public AnalyticsController(UserRepository users, ParticipationRepository participations) {
        this.users = users;
        this.participations = participations;
    }

    @GetMapping("/api/analytics")
    @Transactional(readOnly = true)
    public AnalyticsDto analytics() {
        List<Participation> all = participations.findAll();

        int volunteers = (int) users.findAll().stream()
                .filter(u -> User.ROLE_VOLUNTEER.equals(u.role))
                .count();
        int hours = all.stream().mapToInt(p -> p.hours).sum();
        Stats stats = new Stats(volunteers, all.size(), hours);

        // Последние 5 календарных месяцев, включая текущий
        LocalDate now = LocalDate.now();
        LocalDate from = now.minusMonths(4).withDayOfMonth(1);
        Map<String, Integer> byMonth = new LinkedHashMap<>();
        LocalDate cursor = from;
        while (!cursor.isAfter(now)) {
            byMonth.put(cursor.format(YEAR_MONTH), 0);
            cursor = cursor.plusMonths(1);
        }
        participations.findSince(from).forEach(p ->
                byMonth.merge(p.date.format(YEAR_MONTH), p.hours, Integer::sum));

        List<Bar> bars = byMonth.entrySet().stream()
                .map(e -> new Bar(monthLabel(e.getKey()), e.getValue()))
                .toList();

        // Распределение выполненных заданий по категориям
        Map<String, Integer> byCategory = new TreeMap<>();
        all.forEach(p -> byCategory.merge(p.task.category, 1, Integer::sum));
        int total = all.isEmpty() ? 1 : all.size();
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

        return new AnalyticsDto(stats, bars, categories);
    }

    private static String monthLabel(String yearMonth) {
        LocalDate date = LocalDate.parse(yearMonth + "-01");
        return MONTH_RU[date.getMonthValue() - 1];
    }
}
