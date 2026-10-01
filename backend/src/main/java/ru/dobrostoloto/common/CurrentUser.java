package ru.dobrostoloto.common;

import org.springframework.stereotype.Component;
import ru.dobrostoloto.user.User;
import ru.dobrostoloto.user.UserRepository;

/**
 * Резолвит текущего пользователя по заголовку X-User-Id.
 * Если заголовка нет (гость) — берёт демо-пользователя, чтобы весь сценарий сайта работал без логина.
 */
@Component
public class CurrentUser {

    public static final long DEMO_USER_ID = 1L;

    private final UserRepository users;

    public CurrentUser(UserRepository users) {
        this.users = users;
    }

    public User resolve(Long headerUserId) {
        if (headerUserId != null) {
            var found = users.findById(headerUserId);
            if (found.isPresent()) {
                return found.get();
            }
        }
        return users.findById(DEMO_USER_ID)
                .orElseThrow(() -> new IllegalStateException("Пользователи ещё не загружены"));
    }
}
