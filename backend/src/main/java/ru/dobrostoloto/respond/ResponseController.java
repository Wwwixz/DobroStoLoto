package ru.dobrostoloto.respond;

import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.user.User;

/** Отклики текущего пользователя для страницы «Мои отклики». */
@RestController
@RequestMapping("/api/responses")
public class ResponseController {

    public record ResponseDto(Long taskId, String taskTitle, String foundation, String status, String date) {
    }

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private final TaskResponseRepository responses;
    private final CurrentUser currentUser;

    public ResponseController(TaskResponseRepository responses, CurrentUser currentUser) {
        this.responses = responses;
        this.currentUser = currentUser;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<ResponseDto> list(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        return responses.findByUserIdOrderByCreatedAtDesc(user.id).stream()
                .map(r -> new ResponseDto(
                        r.task.id,
                        r.task.title,
                        r.task.organizer,
                        r.status,
                        r.createdAt.format(DATE)
                ))
                .toList();
    }
}
