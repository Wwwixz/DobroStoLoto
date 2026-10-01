package ru.dobrostoloto.user;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.history.ParticipationRepository;
import ru.dobrostoloto.respond.TaskResponseRepository;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    public record AchievementDto(String key, String title, String desc, boolean earned) {
    }

    private final CurrentUser currentUser;
    private final TaskResponseRepository responses;
    private final ParticipationRepository participations;

    public ProfileController(CurrentUser currentUser, TaskResponseRepository responses,
                             ParticipationRepository participations) {
        this.currentUser = currentUser;
        this.responses = responses;
        this.participations = participations;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public UserDto profile(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return UserDto.from(currentUser.resolve(userId));
    }

    /**
     * Достижения начисляются по фиксированным правилам на основе реальных
     * действий пользователя — никаких случайных выдач.
     */
    @GetMapping("/achievements")
    @Transactional(readOnly = true)
    public List<AchievementDto> achievements(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);

        long responseCount = responses.countByUserId(user.id);
        List<ru.dobrostoloto.history.Participation> done = participations.findByUserIdOrderByDateDesc(user.id);
        Set<String> categories = new HashSet<>();
        int hours = 0;
        for (var p : done) {
            categories.add(p.task.category);
            hours += p.hours;
        }

        List<AchievementDto> list = new ArrayList<>();
        list.add(new AchievementDto("first_response", "Первый шаг",
                "Отправлен первый отклик на задание", responseCount >= 1));
        list.add(new AchievementDto("active", "Активный участник",
                "Отправлено 5 и более откликов на задания", responseCount >= 5));
        list.add(new AchievementDto("animals", "Помощь животным",
                "Участие в задании категории «Животные»", categories.contains("Животные")));
        list.add(new AchievementDto("children", "Забота о детях",
                "Участие в задании категории «Дети»", categories.contains("Дети")));
        list.add(new AchievementDto("hours10", "Волонтёр-часы",
                "Накоплено 10 и более волонтёрских часов", hours >= 10));
        return list;
    }
}
