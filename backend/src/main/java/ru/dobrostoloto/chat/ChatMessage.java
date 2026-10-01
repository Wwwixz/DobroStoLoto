package ru.dobrostoloto.chat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    /** them — собеседник, me — владелец диалога. Формат совпадает с фронтом. */
    public static final String FROM_THEM = "them";
    public static final String FROM_ME = "me";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public Chat chat;

    /** "from" — зарезервированное слово SQL, поэтому колонка названа иначе. */
    @jakarta.persistence.Column(name = "msg_from", length = 10)
    public String from;

    /** Кто реально отправил сообщение (id пользователя). null — системное/авто-сообщение. */
    public Long senderId;

    @jakarta.persistence.Column(length = 2000)
    public String text;

    /** Отображаемое время: «12:42», «Вчера», «Пн». */
    @jakarta.persistence.Column(length = 20)
    public String time;

    /** Прочитано ли сообщение получателем (для счётчика непрочитанных). */
    public boolean read;

    public ChatMessage() {
    }

    public ChatMessage(Chat chat, String from, String text, String time) {
        this.chat = chat;
        this.from = from;
        this.text = text;
        this.time = time;
    }
}
