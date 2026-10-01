package ru.dobrostoloto.notification;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.user.User;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    public record NotificationDto(Long id, String title, String text, boolean read, String time) {
    }

    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM HH:mm");

    private final NotificationRepository notifications;
    private final CurrentUser currentUser;

    public NotificationController(NotificationRepository notifications, CurrentUser currentUser) {
        this.notifications = notifications;
        this.currentUser = currentUser;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<NotificationDto> list(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        return notifications.findByUserIdOrderByCreatedAtDesc(user.id).stream()
                .map(n -> new NotificationDto(n.id, n.title, n.text, n.read, formatTime(n.createdAt)))
                .toList();
    }

    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> readAll(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        notifications.findByUserIdOrderByCreatedAtDesc(user.id)
                .forEach(n -> {
                    n.read = true;
                    notifications.save(n);
                });
        return ResponseEntity.ok().build();
    }

    private static String formatTime(LocalDateTime t) {
        return t.toLocalDate().equals(LocalDateTime.now().toLocalDate())
                ? t.format(TIME)
                : t.format(DATE);
    }
}
