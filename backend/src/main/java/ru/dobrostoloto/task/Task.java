package ru.dobrostoloto.task;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public String title;

    @Column(length = 2000)
    public String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "task_duties", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "duty", length = 500)
    public List<String> duties = new ArrayList<>();

    /** online | offline */
    @Column(nullable = false)
    public String format;

    /** one | regular */
    @Column(nullable = false)
    public String duration;

    @Column(nullable = false)
    public String category;

    @Column(nullable = false)
    public String location;

    @Column(nullable = false)
    public String dateFrom;

    @Column(nullable = false)
    public String dateTo;

    @Column(nullable = false)
    public int slots;

    @Column(nullable = false)
    public int responses;

    public String emoji;

    @Column(length = 300)
    public String gradient;

    @Column(nullable = false)
    public String organizer;

    /** moderation | published | rework */
    @Column(nullable = false)
    public String adminStatus = "published";

    public Task() {
    }
}
