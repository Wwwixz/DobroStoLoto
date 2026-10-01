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
import ru.dobrostoloto.respond.TaskResponse;
import ru.dobrostoloto.respond.TaskResponseRepository;
import ru.dobrostoloto.user.User;

@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskRepository tasks;
    private final TaskResponseRepository responses;
    private final CurrentUser currentUser;

    public TaskController(TaskRepository tasks, TaskResponseRepository responses, CurrentUser currentUser) {
        this.tasks = tasks;
        this.responses = responses;
        this.currentUser = currentUser;
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
                .map(t -> TaskDto.from(t, respondedIds.contains(t.id)))
                .toList();
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
        return TaskDto.from(task, responded);
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
        }
        return ResponseEntity.ok(TaskDto.from(task, true));
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
        return ResponseEntity.ok(TaskDto.from(task, false));
    }
}
