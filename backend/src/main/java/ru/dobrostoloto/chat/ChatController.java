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

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");

    private final ChatRepository chats;
    private final CurrentUser currentUser;

    public ChatController(ChatRepository chats, CurrentUser currentUser) {
        this.chats = chats;
        this.currentUser = currentUser;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<ChatDto> list(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        User user = currentUser.resolve(userId);
        return chats.findAll().stream()
                .filter(c -> c.user.id.equals(user.id))
                .map(ChatController::toDto)
                .toList();
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
        chats.save(chat);
        return ResponseEntity.ok(toDto(chat));
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
