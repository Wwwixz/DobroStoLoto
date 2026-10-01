package ru.dobrostoloto.admin;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    private final TaskRepository tasks;
    private final FoundationRepository foundations;
    private final UserRepository users;

    public AdminController(TaskRepository tasks, FoundationRepository foundations, UserRepository users) {
        this.tasks = tasks;
        this.foundations = foundations;
        this.users = users;
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
    public AdminTaskDto setTaskStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
        Task task = tasks.findById(id).orElseThrow();
        String status = req.status();
        if (!"moderation".equals(status) && !"published".equals(status) && !"rework".equals(status)) {
            throw new IllegalArgumentException("Недопустимый статус задания: " + status);
        }
        task.adminStatus = status;
        tasks.save(task);
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

    // ---- Волонтёры ----

    @GetMapping("/volunteers")
    @Transactional(readOnly = true)
    public List<VolunteerDto> volunteers() {
        return users.findAll().stream()
                .filter(u -> User.ROLE_VOLUNTEER.equals(u.role))
                .map(u -> new VolunteerDto(u.id, u.fullName, u.email, u.hours, u.active ? "active" : "inactive"))
                .toList();
    }
}
