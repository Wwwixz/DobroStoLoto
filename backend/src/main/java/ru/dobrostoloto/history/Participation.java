package ru.dobrostoloto.history;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import ru.dobrostoloto.task.Task;
import ru.dobrostoloto.user.User;

/** Завершённое участие в задании — основа страницы «История» и аналитики. */
@Entity
@Table(name = "participations")
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public Task task;

    @ManyToOne
    public User user;

    @jakarta.persistence.Column(nullable = false)
    public LocalDate date;

    @jakarta.persistence.Column(nullable = false)
    public int hours;

    public Participation() {
    }

    public Participation(Task task, User user, LocalDate date, int hours) {
        this.task = task;
        this.user = user;
        this.date = date;
        this.hours = hours;
    }
}
