package ru.dobrostoloto.task;

import java.util.List;
import java.util.Set;
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
import ru.dobrostoloto.notification.NotificationService;
import ru.dobrostoloto.respond.TaskResponse;
import ru.dobrostoloto.respond.TaskResponseRepository;
import ru.dobrostoloto.user.User;
@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskRepository tasks;
    private final TaskResponseRepository responses;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;

    public TaskController(TaskRepository tasks, TaskResponseRepository responses,
                          CurrentUser currentUser, NotificationService notificationService) {
        this.tasks = tasks;
        this.responses = responses;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
    }

    @GetMapping("/tasks")
    @Transactional(readOnly = true)
    public List<TaskDto> list(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String q,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String category,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String format,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String duration
    ) {
        User user = currentUser.resolve(userId);
        Set<Long> respondedIds = responses.findTaskIdsByUserId(user.id);

        return tasks.findAll().stream()
                .filter(t -> q == null || q.isBlank()
                        || t.title.toLowerCase().contains(q.trim().toLowerCase()))
                .filter(t -> category == null || category.isBlank() || category.equals("Все категории")
                        || t.category.equals(category))
                .filter(t -> format == null || format.isBlank() || format.equals("all") || t.format.equals(format))
                .filter(t -> duration == null || duration.isBlank() || duration.equals("all") || t.duration.equals(duration))
                .map(t -> TaskDto.from(t, respondedIds.contains(t.id),
                        responses.countByTaskIdAndStatus(t.id, "approved")))
                .toList();
    }

    /** Создание задания — доступно фондам и администраторам. */
    public record CreateTaskRequest(String title, String description, List<String> duties, String format,
                                    String duration, String category, String location, String dateFrom,
                                    String dateTo, Integer slots, String emoji, String gradient, String organizer,
                                    Boolean proBono, List<String> skills, String deadline, String timeFrom,
                                    String timeTo, String place, String onlineLink, String contact,
                                    String completionTerms, String expectedResult) {
    }

    @PostMapping("/tasks")
    @Transactional
    public ResponseEntity<TaskDto> create(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @org.springframework.web.bind.annotation.RequestBody CreateTaskRequest req
    ) {
        User user = currentUser.resolve(userId);
        if (!User.ROLE_ADMIN.equals(user.role) && !User.ROLE_FOUNDATION.equals(user.role)) {
            throw new IllegalArgumentException("Создавать задания могут только фонды и администраторы");
        }

        String title = req.title() == null ? "" : req.title().trim();
        if (title.isEmpty()) {
            throw new IllegalArgumentException("Укажите название задания");
        }
        String description = req.description() == null ? "" : req.description().trim();
        if (description.isEmpty()) {
            throw new IllegalArgumentException("Добавьте описание задания");
        }
        String category = req.category() == null ? "" : req.category().trim();
        if (category.isEmpty()) {
            throw new IllegalArgumentException("Выберите категорию");
        }
        String location = req.location() == null ? "" : req.location().trim();
        if (location.isEmpty()) {
            throw new IllegalArgumentException("Укажите город или «Онлайн»");
        }
        int slots = req.slots() == null ? 1 : req.slots();
        if (slots < 1) {
            throw new IllegalArgumentException("Количество волонтёров — минимум 1");
        }

        List<String> duties = req.duties() == null ? List.of()
                : req.duties().stream().map(String::trim).filter(d -> !d.isEmpty()).toList();
        List<String> skills = req.skills() == null ? List.of()
                : req.skills().stream().map(String::trim).filter(s -> !s.isEmpty()).toList();

        String organizer = User.ROLE_FOUNDATION.equals(user.role)
                ? user.fullName
                : (req.organizer() == null || req.organizer().isBlank() ? "Организатор" : req.organizer().trim());

        Task task = new Task();
        fillTask(task, req, user);
        task.title = title;
        task.description = description;
        task.duties.addAll(duties);
        task.skills.addAll(skills);
        task.format = req.format() == null || req.format().isBlank() ? "offline" : req.format();
        task.duration = req.duration() == null || req.duration().isBlank() ? "one" : req.duration();
        task.category = category;
        task.location = location;
        task.dateFrom = req.dateFrom() == null || req.dateFrom().isBlank() ? "—" : req.dateFrom().trim();
        task.dateTo = req.dateTo() == null || req.dateTo().isBlank() ? "—" : req.dateTo().trim();
        task.slots = slots;
        task.responses = 0;
        task.emoji = req.emoji() == null || req.emoji().isBlank() ? "🌟" : req.emoji().trim();
        task.gradient = req.gradient() == null || req.gradient().isBlank() ? gradientFor(category) : req.gradient();
        task.organizer = organizer;
        task.adminStatus = "moderation";
        task.createdAt = java.time.LocalDate.now();
        task.createdBy = user;
        tasks.save(task);
        notificationService.notify(user, "Задание на модерации",
                "Задание «" + task.title + "» отправлено на проверку администратору.");

        return ResponseEntity.ok(TaskDto.from(task, false, 0));
    }

    private static void fillTask(Task task, CreateTaskRequest req, User user) {
        task.proBono = Boolean.TRUE.equals(req.proBono());
        if (req.deadline() != null && !req.deadline().isBlank()) {
            try {
                task.deadline = java.time.LocalDate.parse(req.deadline().trim());
            } catch (Exception e) {
                throw new IllegalArgumentException("Некорректная дата дедлайна");
            }
        }
        task.timeFrom = req.timeFrom() == null ? null : req.timeFrom().trim();
        task.timeTo = req.timeTo() == null ? null : req.timeTo().trim();
        task.place = req.place() == null ? null : req.place().trim();
        task.onlineLink = req.onlineLink() == null ? null : req.onlineLink().trim();
        task.contact = req.contact() == null ? null : req.contact().trim();
        task.completionTerms = req.completionTerms() == null ? null : req.completionTerms().trim();
        task.expectedResult = req.expectedResult() == null ? null : req.expectedResult().trim();
    }

    private static String gradientFor(String category) {
        return switch (category) {
            case "Животные" -> "linear-gradient(135deg, #FFE9B8 0%, #FFD66B 100%)";
            case "Дети" -> "linear-gradient(135deg, #DFF7E7 0%, #B5EAC4 100%)";
            case "Соц. помощь" -> "linear-gradient(135deg, #FFF0D1 0%, #FFDFA6 100%)";
            case "Экология" -> "linear-gradient(135deg, #E5F7E0 0%, #C4E9B5 100%)";
            default -> "linear-gradient(135deg, #E3ECFF 0%, #B8CCF5 100%)";
        };
    }

    @GetMapping("/tasks/{id}")
    @Transactional(readOnly = true)
    public TaskDto get(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        User user = currentUser.resolve(userId);
        Task task = tasks.findById(id).orElseThrow();
        boolean responded = responses.existsByUserIdAndTaskId(user.id, id);
        return TaskDto.from(task, responded, responses.countByTaskIdAndStatus(id, "approved"));
    }

    /** Откликнуться на задание. */
    @PostMapping("/tasks/{id}/respond")
    @Transactional
    public ResponseEntity<TaskDto> respond(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        User user = currentUser.resolve(userId);
        Task task = tasks.findById(id).orElseThrow();

        if (!responses.existsByUserIdAndTaskId(user.id, id)) {
            TaskResponse r = new TaskResponse();
            r.task = task;
            r.user = user;
            r.status = "pending";
            r.createdAt = java.time.LocalDate.now();
            responses.save(r);
            task.responses = task.responses + 1;
            tasks.save(task);
            notificationService.notify(user, "Отклик отправлен",
                    "Ваш отклик на задание «" + task.title + "» отправлен организатору. Ожидайте подтверждения.");
        }
        return ResponseEntity.ok(TaskDto.from(task, true, responses.countByTaskIdAndStatus(id, "approved")));
    }

    /** Отменить отклик. */
    @DeleteMapping("/tasks/{id}/respond")
    @Transactional
    public ResponseEntity<TaskDto> cancelRespond(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        User user = currentUser.resolve(userId);
        Task task = tasks.findById(id).orElseThrow();

        if (responses.existsByUserIdAndTaskId(user.id, id)) {
            responses.deleteByUserIdAndTaskId(user.id, id);
            task.responses = Math.max(0, task.responses - 1);
            tasks.save(task);
        }
        return ResponseEntity.ok(TaskDto.from(task, false, responses.countByTaskIdAndStatus(id, "approved")));
    }
}
