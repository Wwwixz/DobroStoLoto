package ru.dobrostoloto.notification;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.user.User;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    public record NotificationDto(Long id, String title, String text, boolean read, String time, String link) {
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
                .map(n -> new NotificationDto(n.id, n.title, n.text, n.read, formatTime(n.createdAt), n.link))
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

    /** Отметить одно уведомление прочитанным (например, при переходе по нему). */
    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> readOne(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        User user = currentUser.resolve(userId);
        notifications.findById(id)
                .filter(n -> n.user.id.equals(user.id))
                .ifPresent(n -> {
                    n.read = true;
                    notifications.save(n);
                });
        return ResponseEntity.ok().build();
    }

    /** Удалить одно уведомление (после перехода по нему). */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteOne(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        User user = currentUser.resolve(userId);
        notifications.findById(id)
                .filter(n -> n.user.id.equals(user.id))
                .ifPresent(notifications::delete);
        return ResponseEntity.ok().build();
    }

    /** Очистить все уведомления пользователя. */
    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> clearAll(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        notifications.deleteByUserId(user.id);
        return ResponseEntity.ok().build();
    }

    private static String formatTime(LocalDateTime t) {
        return t.toLocalDate().equals(LocalDateTime.now().toLocalDate())
                ? t.format(TIME)
                : t.format(DATE);
    }
}
