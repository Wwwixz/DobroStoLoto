package ru.dobrostoloto.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import ru.dobrostoloto.user.User;

@Entity
@Table(name = "foundations")
public class Foundation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String inn;

    /** pending | approved | rejected */
    @Column(nullable = false)
    public String status;

    // ---- Профиль фонда (по ТЗ) ----

    @Column(length = 2000)
    public String description;

    public String city;

    @Column(length = 300)
    public String website;

    @Column(length = 300)
    public String contactPerson;

    @Column(length = 200)
    public String contactEmail;

    @Column(length = 50)
    public String phone;

    /** Аккаунт фонда, если фонд зарегистрировался сам (для кабинета фонда). */
    @ManyToOne
    public User linkedUser;

    public Foundation() {
    }

    public Foundation(String name, String inn, String status) {
        this.name = name;
        this.inn = inn;
        this.status = status;
    }
}
