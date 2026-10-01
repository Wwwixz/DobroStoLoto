package ru.dobrostoloto.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

    public static final String ROLE_VOLUNTEER = "VOLUNTEER";
    public static final String ROLE_FOUNDATION = "FOUNDATION";
    public static final String ROLE_ADMIN = "ADMIN";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public String fullName;

    @Column(nullable = false, unique = true)
    public String email;

    public String phone;

    @Column(nullable = false)
    public String passwordHash;

    /** VOLUNTEER | FOUNDATION | ADMIN */
    @Column(nullable = false)
    public String role;

    public String city;

    @Column(nullable = false)
    public LocalDate registeredAt = LocalDate.now();

    @Column(nullable = false)
    public int hours;

    @Column(nullable = false)
    public boolean active = true;

    public User() {
    }

    public User(String fullName, String email, String phone, String passwordHash, String role, String city,
                LocalDate registeredAt, int hours, boolean active) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.role = role;
        this.city = city;
        this.registeredAt = registeredAt;
        this.hours = hours;
        this.active = active;
    }
}
