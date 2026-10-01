package ru.dobrostoloto.respond;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import ru.dobrostoloto.task.Task;
import ru.dobrostoloto.user.User;

@Entity
@Table(name = "task_responses",
       uniqueConstraints = @UniqueConstraint(columnNames = {"task_id", "user_id"}))
public class TaskResponse {

    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_APPROVED = "approved";
    public static final String STATUS_REJECTED = "rejected";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public Task task;

    @ManyToOne
    public User user;

    /** pending | approved | rejected */
    public String status;

    public LocalDate createdAt;

    public TaskResponse() {
    }
}
