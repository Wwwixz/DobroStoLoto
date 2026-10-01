package ru.dobrostoloto.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;

@RestController
@RequestMapping("/api")
public class AuthController {

    public record LoginRequest(String login, String password) {
    }

    public record RegisterRequest(String role, String fullName, String email, String phone, String password) {
    }

    private final UserRepository users;
    private final CurrentUser currentUser;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository users, CurrentUser currentUser) {
        this.users = users;
        this.currentUser = currentUser;
    }

    @PostMapping("/auth/register")
    @Transactional
    public ResponseEntity<UserDto> register(@RequestBody RegisterRequest req) {
        String role = req.role() == null ? User.ROLE_VOLUNTEER : req.role().trim().toUpperCase();
        if (!role.equals(User.ROLE_VOLUNTEER) && !role.equals(User.ROLE_FOUNDATION) && !role.equals(User.ROLE_ADMIN)) {
            throw new IllegalArgumentException("Неизвестная роль: " + req.role());
        }
        String fullName = trim(req.fullName());
        String email = trim(req.email());
        String password = req.password() == null ? "" : req.password();
        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Укажите имя и фамилию");
        }
        if (email.isEmpty() || !email.matches("^\\S+@\\S+\\.\\S+$")) {
            throw new IllegalArgumentException("Укажите корректный email");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("Пользователь с таким email уже зарегистрирован");
        }
        if (password.length() < 6) {
            throw new IllegalArgumentException("Пароль должен быть не короче 6 символов");
        }

        User user = new User();
        user.fullName = fullName;
        user.email = email;
        user.phone = trim(req.phone());
        user.passwordHash = encoder.encode(password);
        user.role = role;
        user.city = "";
        user.registeredAt = java.time.LocalDate.now();
        user.hours = 0;
        users.save(user);

        return ResponseEntity.ok(UserDto.from(user));
    }

    @PostMapping("/auth/login")
    @Transactional(readOnly = true)
    public UserDto login(@RequestBody LoginRequest req) {
        String login = trim(req.login());
        String password = req.password() == null ? "" : req.password();

        User user = users.findByEmailIgnoreCase(login)
                .or(() -> users.findByPhone(login))
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден. Проверьте логин."));

        if (!encoder.matches(password, user.passwordHash)) {
            throw new IllegalArgumentException("Неверный пароль");
        }
        return UserDto.from(user);
    }

    @GetMapping("/users/me")
    @Transactional(readOnly = true)
    public UserDto me(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return UserDto.from(currentUser.resolve(userId));
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
