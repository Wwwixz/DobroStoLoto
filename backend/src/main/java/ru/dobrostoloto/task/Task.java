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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import ru.dobrostoloto.user.User;

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

    /** one | regular | longterm */
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

    @Column(nullable = false)
    public LocalDate createdAt = LocalDate.now();

    /** Кто создал задание (фонд или администратор) — для уведомлений и кабинета фонда. */
    @ManyToOne
    public User createdBy;

    // ---- Расширение по ТЗ ----

    /** Обычное задание или Pro Bono (нужны профессиональные навыки). */
    @Column(nullable = false)
    public boolean proBono = false;

    /** Требования к навыкам (Pro Bono и не только). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "task_skills", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "skill", length = 300)
    public List<String> skills = new ArrayList<>();

    /** Дедлайн подачи откликов — для сортировки по срочности. */
    public LocalDate deadline;

    /** Время проведения: с ... до ... */
    @Column(length = 10)
    public String timeFrom;

    @Column(length = 10)
    public String timeTo;

    /** Место проведения (для офлайн). */
    @Column(length = 300)
    public String place;

    /** Ссылка/инструкция для онлайн-заданий. */
    @Column(length = 500)
    public String onlineLink;

    /** Контакт фонда после отклика (email/телефон/чат). */
    @Column(length = 300)
    public String contact;

    /** Условия завершения задания. */
    @Column(length = 1000)
    public String completionTerms;

    /** Ожидаемый результат (для Pro Bono). */
    @Column(length = 1000)
    public String expectedResult;

    /** Задание закрыто фондом. */
    @Column(nullable = false)
    public boolean closed = false;

    /** Комментарий администратора (например, при возврате на доработку). */
    @Column(length = 1000)
    public String adminComment;

    public Task() {
    }
}
