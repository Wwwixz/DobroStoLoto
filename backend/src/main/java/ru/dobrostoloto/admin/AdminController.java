package ru.dobrostoloto.admin;

import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.history.ParticipationRepository;
import ru.dobrostoloto.notification.NotificationService;
import ru.dobrostoloto.respond.TaskResponse;
import ru.dobrostoloto.respond.TaskResponseRepository;
import ru.dobrostoloto.task.Task;
import ru.dobrostoloto.task.TaskRepository;
import ru.dobrostoloto.user.User;
import ru.dobrostoloto.user.UserRepository;

/** Модерация заданий и фондов, список волонтёров — вкладки страницы /admin. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    public record AdminTaskDto(Long id, String title, String foundation, String status) {
    }

    public record FoundationDto(Long id, String name, String inn, String status) {
    }

    public record VolunteerDto(Long id, String name, String email, int hours, String status) {
    }

    public record StatusRequest(String status) {
    }

    public record TaskStatusRequest(String status, String comment) {
    }

    public record CreateFoundationRequest(String name, String inn) {
    }

    public record AdminUserDto(Long id, String fullName, String email, boolean superAdmin, String registeredAt) {
    }

    public record CreateAdminRequest(String fullName, String email, String password) {
    }

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private final TaskRepository tasks;
    private final FoundationRepository foundations;
    private final UserRepository users;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;
    private final TaskResponseRepository taskResponses;
    private final ParticipationRepository participations;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AdminController(TaskRepository tasks, FoundationRepository foundations,
                           UserRepository users, CurrentUser currentUser,
                           NotificationService notificationService,
                           TaskResponseRepository taskResponses, ParticipationRepository participations) {
        this.tasks = tasks;
        this.foundations = foundations;
        this.users = users;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
        this.taskResponses = taskResponses;
        this.participations = participations;
    }

    // ---- Задания ----

    @GetMapping("/tasks")
    @Transactional(readOnly = true)
    public List<AdminTaskDto> tasks() {
        return tasks.findAll().stream()
                .map(t -> new AdminTaskDto(t.id, t.title, t.organizer, t.adminStatus))
                .toList();
    }

    @PostMapping("/tasks/{id}/status")
    @Transactional
    public AdminTaskDto setTaskStatus(@PathVariable Long id, @RequestBody TaskStatusRequest req) {
        Task task = tasks.findById(id).orElseThrow();
        String status = req.status();
        if (!"moderation".equals(status) && !"published".equals(status) && !"rework".equals(status)) {
            throw new IllegalArgumentException("Недопустимый статус задания: " + status);
        }
        task.adminStatus = status;
        task.adminComment = req.comment() == null || req.comment().isBlank() ? null : req.comment().trim();
        tasks.save(task);
        if ("published".equals(status) && task.createdBy != null) {
            notificationService.notify(task.createdBy, "Задание опубликовано",
                    "Ваше задание «" + task.title + "» прошло модерацию и опубликовано на платформе.");
        }
        if ("rework".equals(status) && task.createdBy != null) {
            notificationService.notify(task.createdBy, "Задание возвращено на доработку",
                    "Задание «" + task.title + "» возвращено на доработку."
                            + (task.adminComment != null ? " Комментарий администратора: " + task.adminComment : ""));
        }
        return new AdminTaskDto(task.id, task.title, task.organizer, task.adminStatus);
    }

    // ---- Фонды ----

    @GetMapping("/foundations")
    @Transactional(readOnly = true)
    public List<FoundationDto> foundations() {
        return foundations.findAll().stream()
                .map(f -> new FoundationDto(f.id, f.name, f.inn, f.status))
                .toList();
    }

    @PostMapping("/foundations/{id}/status")
    @Transactional
    public FoundationDto setFoundationStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
        var foundation = foundations.findById(id).orElseThrow();
        String status = req.status();
        if (!"pending".equals(status) && !"approved".equals(status) && !"rejected".equals(status)) {
            throw new IllegalArgumentException("Недопустимый статус фонда: " + status);
        }
        foundation.status = status;
        foundations.save(foundation);
        return new FoundationDto(foundation.id, foundation.name, foundation.inn, foundation.status);
    }

    /** Добавление фонда администратором: заявка сразу попадает на проверку. */
    @PostMapping("/foundations")
    @Transactional
    public FoundationDto createFoundation(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody CreateFoundationRequest req
    ) {
        User requester = currentUser.resolve(userId);
        if (!User.ROLE_ADMIN.equals(requester.role)) {
            throw new IllegalArgumentException("Добавлять фонды может только администратор");
        }
        String name = req.name() == null ? "" : req.name().trim();
        String inn = req.inn() == null ? "" : req.inn().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Укажите название фонда");
        }
        if (!inn.matches("\\d{10}(\\d{2})?")) {
            throw new IllegalArgumentException("ИНН должен состоять из 10 или 12 цифр");
        }
        if (foundations.existsByInn(inn)) {
            throw new IllegalStateException("Фонд с таким ИНН уже добавлен");
        }
        Foundation foundation = new Foundation(name, inn, "pending");
        foundations.save(foundation);
        return new FoundationDto(foundation.id, foundation.name, foundation.inn, foundation.status);
    }

    // ---- Волонтёры ----

    @GetMapping("/volunteers")
    @Transactional(readOnly = true)
    public List<VolunteerDto> volunteers() {
        return users.findAll().stream()
                .filter(u -> User.ROLE_VOLUNTEER.equals(u.role))
                .map(u -> new VolunteerDto(u.id, u.fullName, u.email, u.hours, u.active ? "active" : "inactive"))
                .toList();
    }

    /** Отчётность по участникам: ФИО, регистрация, отклики, выполнение, часы, подразделение, категории. */
    @GetMapping("/report")
    @Transactional(readOnly = true)
    public List<VolunteerReportRow> report() {
        return users.findAll().stream()
                .filter(u -> User.ROLE_VOLUNTEER.equals(u.role))
                .map(u -> {
                    var userResponses = taskResponses.findByUserIdOrderByCreatedAtDesc(u.id);
                    var done = participations.findByUserIdOrderByDateDesc(u.id);
                    var categories = done.stream().map(p -> p.task.category).distinct().toList();
                    long completed = userResponses.stream()
                            .filter(r -> TaskResponse.STATUS_COMPLETED.equals(r.status)
                                    || TaskResponse.STATUS_HOURS_AWARDED.equals(r.status))
                            .count();
                    return new VolunteerReportRow(
                            u.id,
                            u.fullName,
                            u.registeredAt.format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")),
                            userResponses.size(),
                            (int) completed,
                            done.stream().mapToInt(p -> p.hours).sum(),
                            u.hours,
                            u.city == null ? "" : u.city,
                            u.department == null ? "" : u.department,
                            u.position == null ? "" : u.position,
                            categories
                    );
                })
                .toList();
    }

    public record VolunteerReportRow(
            Long id, String fullName, String registeredAt, int responsesCount, int completedCount,
            int participationHours, int awardedHours, String city, String department, String position,
            List<String> categories) {
    }

    // ---- Администраторы (создаёт главный администратор) ----

    @GetMapping("/admins")
    @Transactional(readOnly = true)
    public List<AdminUserDto> admins() {
        return users.findAll().stream()
                .filter(u -> User.ROLE_ADMIN.equals(u.role))
                .map(u -> new AdminUserDto(u.id, u.fullName, u.email, u.superAdmin, u.registeredAt.format(DATE)))
                .toList();
    }

    @PostMapping("/admins")
    @Transactional
    public ResponseEntity<AdminUserDto> createAdmin(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody CreateAdminRequest req
    ) {
        User requester = currentUser.resolve(userId);
        if (!User.ROLE_ADMIN.equals(requester.role) || !requester.superAdmin) {
            throw new IllegalArgumentException("Создавать администраторов может только главный администратор");
        }

        String fullName = req.fullName() == null ? "" : req.fullName().trim();
        String email = req.email() == null ? "" : req.email().trim();
        String password = req.password() == null ? "" : req.password();
        if (fullName.isEmpty()) {
            throw new IllegalArgumentException("Укажите имя и фамилию администратора");
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

        User admin = new User();
        admin.fullName = fullName;
        admin.email = email;
        admin.phone = "";
        admin.passwordHash = encoder.encode(password);
        admin.role = User.ROLE_ADMIN;
        admin.superAdmin = false;
        admin.city = "";
        admin.registeredAt = java.time.LocalDate.now();
        users.save(admin);

        return ResponseEntity.ok(new AdminUserDto(admin.id, admin.fullName, admin.email,
                admin.superAdmin, admin.registeredAt.format(DATE)));
    }
}
