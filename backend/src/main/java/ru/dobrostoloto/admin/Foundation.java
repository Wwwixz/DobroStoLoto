package ru.dobrostoloto.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

    public Foundation() {
    }

    public Foundation(String name, String inn, String status) {
        this.name = name;
        this.inn = inn;
        this.status = status;
    }
}
