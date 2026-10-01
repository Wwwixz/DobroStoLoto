package ru.dobrostoloto.seed;

import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.dobrostoloto.chat.Chat;
import ru.dobrostoloto.chat.ChatMessage;
import ru.dobrostoloto.chat.ChatRepository;
import ru.dobrostoloto.user.User;
import ru.dobrostoloto.user.UserRepository;

/**
 * При старте создаёт демо-аккаунты и пример диалога с непрочитанными сообщениями.
 * Остальной контент (фонды, задания, отклики) создаётся пользователями через интерфейс.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final ChatRepository chats;

    public DataSeeder(UserRepository users, ChatRepository chats) {
        this.users = users;
        this.chats = chats;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // id = 1, fallback для гостей (CurrentUser.DEMO_USER_ID)
        User alexey = users.save(new User("Алексей Иванов", "alexey@mail.ru", "+7 999 123-45-67",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Москва", LocalDate.of(2025, 4, 12), 0, true));
        users.save(new User("Мария Петрова", "m.petrova@mail.ru", "+7 999 123-45-68",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Москва", LocalDate.of(2025, 4, 20), 0, true));
        users.save(new User("Игорь Сидоров", "igor.s@mail.ru", "+7 999 123-45-69",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Санкт-Петербург", LocalDate.of(2025, 4, 22), 0, true));
        users.save(new User("Анна Смирнова", "anna.sm@mail.ru", "+7 999 123-45-70",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Казань", LocalDate.of(2025, 5, 2), 0, false));

        User mainAdmin = users.save(new User("Администратор", "admin@dobro.ru", "+7 999 000-00-01",
                encoder.encode("admin123"), User.ROLE_ADMIN, "Москва", LocalDate.of(2025, 1, 10), 0, true));
        mainAdmin.superAdmin = true;
        users.save(mainAdmin);

        User fond = users.save(new User("Фонд «Добрые лапы»", "fond@lapy.ru", "+7 999 000-00-02",
                encoder.encode("fond123"), User.ROLE_FOUNDATION, "Москва", LocalDate.of(2025, 2, 1), 0, true));

        // Пример диалога волонтёр ↔ фонд: два непрочитанных сообщения от фонда
        Chat demo = new Chat();
        demo.user = alexey;
        demo.partner = fond;
        demo.name = fond.fullName;
        chats.save(demo);
        ChatMessage m1 = new ChatMessage(demo, ChatMessage.FROM_THEM,
                "Здравствуйте, Алексей! Спасибо за отклик на задание «Помощь приюту для животных».",
                "09:05");
        m1.senderId = fond.id;
        m1.read = true;
        demo.messages.add(m1);
        ChatMessage m2 = new ChatMessage(demo, ChatMessage.FROM_ME,
                "Здравствуйте! Готов помочь. Когда можно подъехать?",
                "09:12");
        m2.senderId = alexey.id;
        m2.read = true;
        demo.messages.add(m2);
        ChatMessage m3 = new ChatMessage(demo, ChatMessage.FROM_THEM,
                "Будем рады видеть вас в субботу в 10:00, адрес: ул. Лесная, 5. Возьмите перчатки!",
                "09:40");
        m3.senderId = fond.id;
        demo.messages.add(m3);
        ChatMessage m4 = new ChatMessage(demo, ChatMessage.FROM_THEM,
                "Перед визитом с вами свяжется куратор Мария и всё расскажет.",
                "09:41");
        m4.senderId = fond.id;
        demo.messages.add(m4);
        chats.save(demo);
    }
}
