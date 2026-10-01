package ru.dobrostoloto.notification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.dobrostoloto.user.User;

/** Единая точка создания уведомлений для всех событий платформы. */
@Service
public class NotificationService {

    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @Transactional
    public void notify(User user, String title, String text) {
        notify(user, title, text, null);
    }

    @Transactional
    public void notify(User user, String title, String text, String link) {
        Notification n = new Notification();
        n.user = user;
        n.title = title;
        n.text = text;
        n.link = link;
        notifications.save(n);
    }
}
