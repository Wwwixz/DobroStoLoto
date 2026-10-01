package ru.dobrostoloto.fund;

import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.history.Participation;
import ru.dobrostoloto.history.ParticipationRepository;
import ru.dobrostoloto.notification.NotificationService;
import ru.dobrostoloto.respond.TaskResponse;
import ru.dobrostoloto.respond.TaskResponseRepository;
import ru.dobrostoloto.task.Task;
import ru.dobrostoloto.task.TaskRepository;
import ru.dobrostoloto.user.User;

/**
 * Личный кабинет фонда: задания, откликнувшиеся волонтёры, подтверждение
 * участия, начисление часов, закрытие задания и отчётность.
 */
@RestController
@RequestMapping("/api/fund")
public class FundController {

    public record FundTaskDto(Long id, String title, String status, boolean closed, String adminComment,
                              int responsesCount, int approvedCount, int confirmedCount, int slots) {
    }

    public record ApplicantDto(Long responseId, Long volunteerId, String fullName, String city,
                               String department, String position, int volunteerHours, String registeredAt,
                               String status, int hoursAwarded) {
    }

    public record ReportDto(int tasksTotal, int tasksActive, int tasksClosed, int responsesTotal,
                            int responsesApproved, int volunteersConfirmed, int hoursTotal) {
    }

    public record ApplicantStatusRequest(String status) {
    }

    public record AwardRequest(int hours) {
    }

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private final TaskRepository tasks;
    private final TaskResponseRepository responses;
    private final ParticipationRepository participations;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;

    public FundController(TaskRepository tasks, TaskResponseRepository responses,
                          ParticipationRepository participations, CurrentUser currentUser,
                          NotificationService notificationService) {
        this.tasks = tasks;
        this.responses = responses;
        this.participations = participations;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
    }

    /** Задания текущего фонда со статусами, комментариями администратора и статистикой откликов. */
    @GetMapping("/tasks")
    @Transactional(readOnly = true)
    public List<FundTaskDto> tasks(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        return tasks.findAll().stream()
                .filter(t -> t.createdBy != null && t.createdBy.id.equals(user.id))
                .map(this::toTaskDto)
                .toList();
    }

    /** Откликнувшиеся волонтёры по конкретному заданию фонда. */
    @GetMapping("/tasks/{id}/applicants")
    @Transactional(readOnly = true)
    public List<ApplicantDto> applicants(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        Task task = ownTask(userId, id);
        return responses.findByTaskId(id).stream()
                .map(r -> new ApplicantDto(
                        r.id,
                        r.user.id,
                        r.user.fullName,
                        r.user.city == null ? "" : r.user.city,
                        r.user.department == null ? "" : r.user.department,
                        r.user.position == null ? "" : r.user.position,
                        r.user.hours,
                        r.user.registeredAt.format(DATE),
                        r.status,
                        r.hoursAwarded
                ))
                .toList();
    }

    /** Две стадии подтверждения: фонд принимает или отклоняет заявку на участие. */
    @PostMapping("/applicants/{responseId}/status")
    @Transactional
    public ResponseEntity<Void> decideApplicant(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long responseId,
            @RequestBody ApplicantStatusRequest req
    ) {
        TaskResponse r = responses.findById(responseId).orElseThrow();
        ownTask(userId, r.task.id);
        String status = req.status();
        if (!TaskResponse.STATUS_APPROVED.equals(status) && !TaskResponse.STATUS_REJECTED.equals(status)) {
            throw new IllegalArgumentException("Статус заявки: approved или rejected");
        }
        r.status = status;
        responses.save(r);
        if (TaskResponse.STATUS_APPROVED.equals(status)) {
            notificationService.notify(r.user, "Отклик принят",
                    "Фонд подтвердил ваше участие в задании «" + r.task.title
                            + "». Организационная информация появится в разделе «Мои отклики».",
                    "/responses");
        } else {
            notificationService.notify(r.user, "Отклик отклонён",
                    "К сожалению, фонд отклонил ваш отклик на задание «" + r.task.title + "».",
                    "/responses");
        }
        return ResponseEntity.ok().build();
    }

    /** Начисление волонтёрских часов за фактически подтверждённое участие. */
    @PostMapping("/applicants/{responseId}/award")
    @Transactional
    public ResponseEntity<Void> awardHours(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long responseId,
            @RequestBody AwardRequest req
    ) {
        TaskResponse r = responses.findById(responseId).orElseThrow();
        ownTask(userId, r.task.id);
        if (!TaskResponse.STATUS_COMPLETED.equals(r.status) && !TaskResponse.STATUS_APPROVED.equals(r.status)) {
            throw new IllegalArgumentException("Часы начисляются после подтверждения участия в завершённом задании");
        }
        if (req.hours() < 1 || req.hours() > 24) {
            throw new IllegalArgumentException("Часы: от 1 до 24");
        }
        r.status = TaskResponse.STATUS_HOURS_AWARDED;
        r.hoursAwarded = req.hours();
        responses.save(r);

        r.user.hours += req.hours();
        participations.save(new Participation(r.task, r.user, java.time.LocalDate.now(), req.hours()));
        notificationService.notify(r.user, "Часы начислены",
                "+" + req.hours() + " волонтёрских часов за задание «" + r.task.title + "». Часы уже в вашем профиле.",
                "/history");
        return ResponseEntity.ok().build();
    }

    /** Закрытие задания: подтверждённые волонтёры получают статус «задание завершено». */
    @PostMapping("/tasks/{id}/close")
    @Transactional
    public ResponseEntity<Void> closeTask(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        Task task = ownTask(userId, id);
        task.closed = true;
        tasks.save(task);
        responses.findByTaskId(id).stream()
                .filter(r -> TaskResponse.STATUS_APPROVED.equals(r.status))
                .forEach(r -> {
                    r.status = TaskResponse.STATUS_COMPLETED;
                    responses.save(r);
                    notificationService.notify(r.user, "Задание завершено",
                            "Задание «" + task.title + "» завершено. Фонд может подтвердить ваше участие и начислить часы.",
                            "/history");
                });
        return ResponseEntity.ok().build();
    }

    /** Отчётность фонда. */
    @GetMapping("/report")
    @Transactional(readOnly = true)
    public ReportDto report(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        List<Task> own = tasks.findAll().stream()
                .filter(t -> t.createdBy != null && t.createdBy.id.equals(user.id))
                .toList();
        List<Long> ids = own.stream().map(t -> t.id).toList();
        List<TaskResponse> allResponses = ids.isEmpty() ? List.of()
                : ids.stream().flatMap(rid -> responses.findByTaskId(rid).stream()).toList();

        int confirmed = (int) allResponses.stream()
                .filter(r -> TaskResponse.STATUS_HOURS_AWARDED.equals(r.status)).count();
        return new ReportDto(
                own.size(),
                (int) own.stream().filter(t -> "published".equals(t.adminStatus) && !t.closed).count(),
                (int) own.stream().filter(t -> t.closed).count(),
                allResponses.size(),
                (int) allResponses.stream().filter(r -> TaskResponse.STATUS_APPROVED.equals(r.status)).count(),
                confirmed,
                allResponses.stream().filter(r -> TaskResponse.STATUS_HOURS_AWARDED.equals(r.status))
                        .mapToInt(r -> r.hoursAwarded).sum()
        );
    }

    private Task ownTask(Long headerUserId, Long taskId) {
        User user = currentUser.resolve(headerUserId);
        Task task = tasks.findById(taskId).orElseThrow();
        boolean owner = task.createdBy != null && task.createdBy.id.equals(user.id);
        if (!owner && !User.ROLE_ADMIN.equals(user.role)) {
            throw new IllegalArgumentException("Доступно только автору задания или администратору");
        }
        return task;
    }

    private FundTaskDto toTaskDto(Task t) {
        return new FundTaskDto(
                t.id,
                t.title,
                t.adminStatus,
                t.closed,
                t.adminComment,
                t.responses,
                (int) responses.countByTaskIdAndStatus(t.id, TaskResponse.STATUS_APPROVED),
                (int) responses.countByTaskIdAndStatus(t.id, TaskResponse.STATUS_HOURS_AWARDED),
                t.slots
        );
    }
}
