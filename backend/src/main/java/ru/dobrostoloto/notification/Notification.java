package ru.dobrostoloto.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import ru.dobrostoloto.user.User;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public User user;

    @Column(nullable = false)
    public String title;

    @Column(nullable = false, length = 1000)
    public String text;

    @Column(nullable = false)
    public boolean read;

    @Column(nullable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {
    }
}
