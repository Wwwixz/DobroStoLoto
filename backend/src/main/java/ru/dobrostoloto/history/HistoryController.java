package ru.dobrostoloto.history;

import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.user.User;

/** Завершённые задания текущего пользователя для страницы «История». */
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    public record HistoryDto(Long taskId, String title, String foundation, String date, int hours, String gradient) {
    }

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private final ParticipationRepository participations;
    private final CurrentUser currentUser;

    public HistoryController(ParticipationRepository participations, CurrentUser currentUser) {
        this.participations = participations;
        this.currentUser = currentUser;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<HistoryDto> list(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        return participations.findByUserIdOrderByDateDesc(user.id).stream()
                .map(p -> new HistoryDto(
                        p.task.id,
                        p.task.title,
                        p.task.organizer,
                        p.date.format(DATE),
                        p.hours,
                        p.task.gradient
                ))
                .toList();
    }
}
