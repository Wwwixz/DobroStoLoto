package ru.dobrostoloto.chat;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import ru.dobrostoloto.user.User;

@Entity
@Table(name = "chats")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    /** Владелец диалога (в демо — волонтёр). */
    @ManyToOne
    public User user;

    /** Собеседник: фонд, портал, администратор. */
    @jakarta.persistence.Column(nullable = false)
    public String name;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    public List<ChatMessage> messages = new ArrayList<>();

    public Chat() {
    }
}
