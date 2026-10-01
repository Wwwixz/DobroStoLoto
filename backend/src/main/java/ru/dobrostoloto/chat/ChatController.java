package ru.dobrostoloto.chat;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dobrostoloto.common.CurrentUser;
import ru.dobrostoloto.notification.NotificationService;
import ru.dobrostoloto.user.User;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    public record MessageDto(String from, String text, String time) {
    }

    public record ChatDto(Long id, String name, String last, String time, List<MessageDto> messages) {
    }

    public record SendMessageRequest(String text) {
    }

    /** Создание диалога: с фондом (со страницы задания) или с техподдержкой. */
    public record CreateChatRequest(String name, String taskTitle) {
    }

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");
    private static final String SUPPORT_CHAT = "Техподдержка";

    private static final String[] SUPPORT_REPLIES = {
            "Приняли ваш вопрос, уже разбираемся!",
            "Оператор подключился. Уточните, пожалуйста, номер задания.",
            "Ответили вам на корпоративную почту, проверьте письмо.",
            "Спасибо за обращение! Рады помочь."
    };

    private static final String[] FUND_REPLIES = {
            "Здравствуйте! Спасибо за обращение — подскажем все детали участия.",
            "Мы на связи! Расскажем про место, время и что взять с собой.",
            "Отличный вопрос! Ответим подробно в течение дня.",
            "Спасибо, ждём вас на задании!"
    };

    private final ChatRepository chats;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;

    public ChatController(ChatRepository chats, CurrentUser currentUser, NotificationService notificationService) {
        this.chats = chats;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
    }

    @GetMapping
    @Transactional
    public List<ChatDto> list(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        ensureSupportChat(user);
        return chats.findAll().stream()
                .filter(c -> c.user.id.equals(user.id))
                .map(ChatController::toDto)
                .toList();
    }

    /** Создать (или открыть существующий) диалог с фондом. */
    @PostMapping
    @Transactional
    public ChatDto create(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody CreateChatRequest req
    ) {
        User user = currentUser.resolve(userId);
        String name = req.name() == null ? "" : req.name().trim();
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Укажите получателя диалога");
        }
        Chat chat = chats.findByUserIdAndName(user.id, name).orElse(null);
        if (chat == null) {
            chat = new Chat();
            chat.user = user;
            chat.name = name;
            chats.save(chat);
            String greeting = req.taskTitle() == null || req.taskTitle().isBlank()
                    ? "Здравствуйте! Мы на связи и готовы ответить на ваши вопросы."
                    : "Здравствуйте! Вы откликнулись на задание «" + req.taskTitle()
                            + "» — расскажем детали участия, пишите.";
            chat.messages.add(new ChatMessage(chat, ChatMessage.FROM_THEM, greeting, LocalTime.now().format(HHMM)));
            chats.save(chat);
        }
        return toDto(chat);
    }

    @PostMapping("/{id}/messages")
    @Transactional
    public ResponseEntity<ChatDto> send(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id,
            @RequestBody SendMessageRequest req
    ) {
        User user = currentUser.resolve(userId);
        Chat chat = chats.findById(id).orElseThrow();
        if (!chat.user.id.equals(user.id)) {
            throw new IllegalArgumentException("Это не ваш диалог");
        }
        String text = req.text() == null ? "" : req.text().trim();
        if (text.isEmpty()) {
            throw new IllegalArgumentException("Сообщение пустое");
        }
        chat.messages.add(new ChatMessage(chat, ChatMessage.FROM_ME, text, LocalTime.now().format(HHMM)));

        // Авто-ответ собеседника (фонд или техподдержка), чтобы диалог был живым
        String reply = pickReply(chat);
        chat.messages.add(new ChatMessage(chat, ChatMessage.FROM_THEM, reply, LocalTime.now().format(HHMM)));
        chats.save(chat);
        notificationService.notify(user, "Новое сообщение",
                chat.name + ": " + (reply.length() > 70 ? reply.substring(0, 70) + "…" : reply));

        return ResponseEntity.ok(toDto(chat));
    }

    /** Диалог с техподдержкой есть у каждого пользователя по умолчанию. */
    private void ensureSupportChat(User user) {
        if (chats.findByUserIdAndName(user.id, SUPPORT_CHAT).isEmpty()) {
            Chat chat = new Chat();
            chat.user = user;
            chat.name = SUPPORT_CHAT;
            chats.save(chat);
            chat.messages.add(new ChatMessage(chat, ChatMessage.FROM_THEM,
                    "Добро пожаловать в техподдержку «Помогать проСТО»! Опишите проблему — поможем.",
                    LocalTime.now().format(HHMM)));
            chats.save(chat);
        }
    }

    private String pickReply(Chat chat) {
        String[] pool = SUPPORT_CHAT.equals(chat.name) ? SUPPORT_REPLIES : FUND_REPLIES;
        int index = (chat.messages.size() / 2) % pool.length;
        return pool[index];
    }

    private static ChatDto toDto(Chat chat) {
        List<MessageDto> messages = chat.messages.stream()
                .map(m -> new MessageDto(m.from, m.text, m.time))
                .toList();
        String last = "";
        String time = "";
        if (!chat.messages.isEmpty()) {
            ChatMessage lastMsg = chat.messages.get(chat.messages.size() - 1);
            last = lastMsg.text.length() > 34 ? lastMsg.text.substring(0, 34) + "…" : lastMsg.text;
            time = lastMsg.time;
        }
        return new ChatDto(chat.id, chat.name, last, time, messages);
    }
}
