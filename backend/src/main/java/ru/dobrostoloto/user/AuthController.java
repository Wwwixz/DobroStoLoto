package ru.dobrostoloto.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.admin.Foundation;
import ru.dobrostoloto.admin.FoundationRepository;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.notification.NotificationService;

@RestController
@RequestMapping("/api")
public class AuthController {

    public record LoginRequest(String login, String password) {
    }

    public record RegisterRequest(String role, String fullName, String email, String phone, String password,
                                  String foundationName, String inn) {
    }

    private final UserRepository users;
    private final FoundationRepository foundations;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository users, FoundationRepository foundations,
                          CurrentUser currentUser, NotificationService notificationService) {
        this.users = users;
        this.foundations = foundations;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
    }

    /** Подтягивание данных сотрудника из замоканной базы по корпоративной почте или табельному ID. */
    @GetMapping("/employees/lookup")
    public EmployeeDirectory.Employee lookupEmployee(@RequestParam String query) {
        return EmployeeDirectory.findByEmailOrId(query)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Сотрудник не найден. Попробуйте корпоративную почту, например a.ivanov@stoloto.ru, или ID, например 1002"));
    }

    @PostMapping("/auth/register")
    @Transactional
    public ResponseEntity<UserDto> register(@RequestBody RegisterRequest req) {
        String role = req.role() == null ? User.ROLE_VOLUNTEER : req.role().trim().toUpperCase();
        if (!role.equals(User.ROLE_VOLUNTEER) && !role.equals(User.ROLE_FOUNDATION) && !role.equals(User.ROLE_ADMIN)) {
            throw new IllegalArgumentException("Неизвестная роль: " + req.role());
        }
        if (role.equals(User.ROLE_ADMIN)) {
            throw new IllegalArgumentException(
                    "Регистрация администраторов закрыта: администраторов создаёт главный администратор платформы");
        }
        String fullName = trim(req.fullName());
        String email = trim(req.email());
        String phone = trim(req.phone());
        String password = req.password() == null ? "" : req.password();
        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Укажите имя и фамилию");
        }
        if (email.isEmpty() || !email.matches("^\\S+@\\S+\\.\\S+$")) {
            throw new IllegalArgumentException("Укажите корректный email");
        }
        validatePhone(phone);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("Пользователь с таким email уже зарегистрирован");
        }
        if (password.length() < 6) {
            throw new IllegalArgumentException("Пароль должен быть не короче 6 символов");
        }

        // Регистрация фонда: сразу создаём заявку фонда на проверку
        Foundation foundation = null;
        if (role.equals(User.ROLE_FOUNDATION)) {
            String foundationName = trim(req.foundationName());
            String inn = trim(req.inn());
            if (foundationName.isEmpty()) {
                throw new IllegalArgumentException("Укажите название фонда");
            }
            if (!inn.matches("\\d{10}(\\d{2})?")) {
                throw new IllegalArgumentException("ИНН должен состоять из 10 или 12 цифр");
            }
            if (foundations.existsByInn(inn)) {
                throw new IllegalStateException("Фонд с таким ИНН уже зарегистрирован");
            }
            foundation = new Foundation(foundationName, inn, "pending");
        }

        User user = new User();
        user.email = email;
        user.phone = phone;
        user.passwordHash = encoder.encode(password);
        user.role = role;
        user.registeredAt = java.time.LocalDate.now();
        user.hours = 0;

        if (role.equals(User.ROLE_VOLUNTEER)) {
            // Волонтёр регистрируется по корпоративной почте/ID — данные подтягиваем из базы сотрудников
            EmployeeDirectory.Employee employee = EmployeeDirectory.findByEmailOrId(email)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Регистрация волонтёра доступна только по корпоративной почте или ID сотрудника (например, a.ivanov@stoloto.ru)"));
            user.fullName = employee.fullName();
            user.city = employee.city();
            user.department = employee.department();
            user.position = employee.position();
        } else {
            user.fullName = fullName;
            user.city = "";
        }
        users.save(user);

        if (foundation != null) {
            foundation.linkedUser = user;
            foundations.save(foundation);
        }
        notificationService.notify(user, "Добро пожаловать!",
                "Вы зарегистрированы на платформе «Помогать проСТО». Заполните профиль и откликнитесь на первое задание.");

        return ResponseEntity.ok(UserDto.from(user));
    }

    /** Телефон необязателен, но если указан — это должен быть номер, а не почта. */
    private static void validatePhone(String phone) {
        if (phone.isEmpty()) {
            return;
        }
        String digits = phone.replaceAll("\\D", "");
        boolean looksLikePhone = !phone.contains("@")
                && phone.matches("^\\+?[0-9()\\s-]{10,20}$")
                && digits.length() >= 10
                && digits.length() <= 12;
        if (!looksLikePhone) {
            throw new IllegalArgumentException("Укажите корректный номер телефона (например, +7 999 123-45-67)");
        }
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
