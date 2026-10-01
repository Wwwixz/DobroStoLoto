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
import ru.dobrostoloto.task.Task;
import ru.dobrostoloto.task.TaskRepository;
import ru.dobrostoloto.user.User;

/**
 * Двусторонние диалоги: волонтёр ↔ фонд и волонтёр ↔ техподдержка.
 * Диалог видят обе стороны, у каждой сообщение собеседника — «them», своё — «me».
 */
@RestController
@RequestMapping("/api/chats")
public class ChatController {

    public record MessageDto(String from, String text, String time) {
    }

    public record ChatDto(Long id, String name, String last, String time, long unread, List<MessageDto> messages) {
    }

    public record SendMessageRequest(String text) {
    }

    /** Создание диалога: с фондом (со страницы задания) или с техподдержкой. */
    public record CreateChatRequest(String name, String taskTitle, Long taskId) {
    }

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");
    private static final String SUPPORT_CHAT = "Техподдержка";

    private static final String[] SUPPORT_REPLIES = {
            "Приняли ваш вопрос, уже разбираемся!",
            "Оператор подключился. Уточните, пожалуйста, номер задания.",
            "Ответили вам на корпоративную почту, проверьте письмо.",
            "Спасибо за обращение! Рады помочь."
    };

    private final ChatRepository chats;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;
    private final TaskRepository tasks;

    public ChatController(ChatRepository chats, CurrentUser currentUser,
                          NotificationService notificationService, TaskRepository tasks) {
        this.chats = chats;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
        this.tasks = tasks;
    }

    @GetMapping
    @Transactional
    public List<ChatDto> list(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        ensureSupportChat(user);
        return chats.findAll().stream()
                .filter(c -> isParticipant(c, user))
                .map(c -> toDto(c, user))
                .toList();
    }

    /** Создать (или открыть существующий) диалог с фондом по заданию. */
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
        // Фонд-получатель — автор задания, если диалог открыт со страницы задания
        User partner = null;
        if (req.taskId() != null) {
            Task task = tasks.findById(req.taskId()).orElse(null);
            if (task != null && task.createdBy != null) {
                partner = task.createdBy;
            }
        }

        Chat chat = chats.findByUserIdAndName(user.id, name).orElse(null);
        if (chat == null) {
            chat = new Chat();
            chat.user = user;
            chat.name = name;
            chat.partner = partner;
            chats.save(chat);
            String greeting = req.taskTitle() == null || req.taskTitle().isBlank()
                    ? "Здравствуйте! Мы на связи и готовы ответить на ваши вопросы."
                    : "Здравствуйте! Волонтёр откликнулся на задание «" + req.taskTitle()
                            + "» — здесь можно обсудить детали участия.";
            ChatMessage greetingMsg = new ChatMessage(chat, ChatMessage.FROM_THEM, greeting,
                    LocalTime.now().format(HHMM));
            greetingMsg.senderId = partner != null ? partner.id : null;
            chat.messages.add(greetingMsg);
            chats.save(chat);
            if (partner != null) {
                notificationService.notify(partner, "Новый диалог",
                        user.fullName + " открыл переписку по заданию «"
                                + (req.taskTitle() == null ? "" : req.taskTitle()) + "».",
                        "/messages?chat=" + chat.id);
            }
        } else if (chat.partner == null && partner != null) {
            chat.partner = partner;
            chats.save(chat);
        }
        return toDto(chat, user);
    }

    @PostMapping("/{id}/messages")
    @Transactional
    public ResponseEntity<ChatDto> send(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id,
            @RequestBody SendMessageRequest req
    ) {
        User viewer = currentUser.resolve(userId);
        Chat chat = chats.findById(id).orElseThrow();
        boolean owner = chat.user.id.equals(viewer.id);
        boolean partnerSide = chat.partner != null && chat.partner.id.equals(viewer.id);
        if (!owner && !partnerSide) {
            throw new IllegalArgumentException("Нет доступа к этому диалогу");
        }
        String text = req.text() == null ? "" : req.text().trim();
        if (text.isEmpty()) {
            throw new IllegalArgumentException("Сообщение пустое");
        }

        ChatMessage msg = new ChatMessage(chat, owner ? ChatMessage.FROM_ME : ChatMessage.FROM_THEM, text,
                LocalTime.now().format(HHMM));
        msg.senderId = viewer.id;
        chat.messages.add(msg);

        // Живой авто-ответ только у техподдержки; в диалогах фонд ↔ волонтёр отвечают люди
        if (chat.partner == null && SUPPORT_CHAT.equals(chat.name)) {
            ChatMessage reply = new ChatMessage(chat, ChatMessage.FROM_THEM,
                    pickSupportReply(chat), LocalTime.now().format(HHMM));
            chat.messages.add(reply);
            notificationService.notify(viewer, "Новое сообщение",
                    chat.name + ": " + truncate(reply.text), "/messages?chat=" + chat.id);
        } else if (partnerSide) {
            // Фонд ответил — уведомляем волонтёра
            notificationService.notify(chat.user, "Новое сообщение",
                    "Фонд «" + chat.name + "»: " + truncate(text), "/messages?chat=" + chat.id);
        } else if (chat.partner != null) {
            // Волонтёр написал — уведомляем фонд
            notificationService.notify(chat.partner, "Новое сообщение",
                    "От " + chat.user.fullName + " (диалог «" + chat.name + "»): " + truncate(text),
                    "/messages?chat=" + chat.id);
        }
        chats.save(chat);
        return ResponseEntity.ok(toDto(chat, viewer));
    }

    /** Диалог с техподдержкой есть у каждого пользователя по умолчанию. */
    private void ensureSupportChat(User user) {
        if (chats.findByUserIdAndName(user.id, SUPPORT_CHAT).isEmpty()) {
            Chat chat = new Chat();
            chat.user = user;
            chat.name = SUPPORT_CHAT;
            chats.save(chat);
            ChatMessage welcome = new ChatMessage(chat, ChatMessage.FROM_THEM,
                    "Добро пожаловать в техподдержку «Помогать проСТО»! Опишите проблему — поможем.",
                    LocalTime.now().format(HHMM));
            chat.messages.add(welcome);
            chats.save(chat);
        }
    }

    /** Отметить все сообщения диалога прочитанными для текущего зрителя. */
    @PostMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markRead(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @PathVariable Long id
    ) {
        User viewer = currentUser.resolve(userId);
        Chat chat = chats.findById(id).orElseThrow();
        if (!isParticipant(chat, viewer)) {
            throw new IllegalArgumentException("Нет доступа к этому диалогу");
        }
        chat.messages.stream()
                .filter(m -> !m.read && (m.senderId == null || !m.senderId.equals(viewer.id)))
                .forEach(m -> m.read = true);
        chats.save(chat);
        return ResponseEntity.ok().build();
    }

    private String pickSupportReply(Chat chat) {
        int index = (chat.messages.size() / 2) % SUPPORT_REPLIES.length;
        return SUPPORT_REPLIES[index];
    }

    private static boolean isParticipant(Chat chat, User user) {
        return chat.user.id.equals(user.id)
                || (chat.partner != null && chat.partner.id.equals(user.id));
    }

    private static String truncate(String text) {
        return text.length() > 70 ? text.substring(0, 70) + "…" : text;
    }

    /** DTO зависит от того, кто смотрит: название и стороны сообщений — относительно зрителя. */
    private static ChatDto toDto(Chat chat, User viewer) {
        boolean ownerViewing = chat.user.id.equals(viewer.id);
        List<MessageDto> messages = chat.messages.stream()
                .map(m -> new MessageDto(
                        // системные (senderId == null) всегда «them»; иначе — сравниваем со зрителем
                        m.senderId == null ? ChatMessage.FROM_THEM
                                : (m.senderId.equals(viewer.id) ? ChatMessage.FROM_ME : ChatMessage.FROM_THEM),
                        m.text,
                        m.time
                ))
                .toList();
        long unread = chat.messages.stream()
                .filter(m -> !m.read && (m.senderId == null || !m.senderId.equals(viewer.id)))
                .count();
        String last = "";
        String time = "";
        if (!chat.messages.isEmpty()) {
            ChatMessage lastMsg = chat.messages.get(chat.messages.size() - 1);
            last = lastMsg.text.length() > 34 ? lastMsg.text.substring(0, 34) + "…" : lastMsg.text;
            time = lastMsg.time;
        }
        String title = ownerViewing ? chat.name
                : (chat.user.fullName == null ? chat.name : chat.user.fullName);
        return new ChatDto(chat.id, title, last, time, unread, messages);
    }
}
