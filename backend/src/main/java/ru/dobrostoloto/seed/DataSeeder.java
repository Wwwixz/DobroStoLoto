package ru.dobrostoloto.seed;

import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.dobrostoloto.admin.Foundation;
import ru.dobrostoloto.admin.FoundationRepository;
import ru.dobrostoloto.chat.Chat;
import ru.dobrostoloto.chat.ChatMessage;
import ru.dobrostoloto.chat.ChatRepository;
import ru.dobrostoloto.history.Participation;
import ru.dobrostoloto.history.ParticipationRepository;
import ru.dobrostoloto.respond.TaskResponse;
import ru.dobrostoloto.respond.TaskResponseRepository;
import ru.dobrostoloto.task.Task;
import ru.dobrostoloto.task.TaskRepository;
import ru.dobrostoloto.user.User;
import ru.dobrostoloto.user.UserRepository;

/** Наполняет H2 теми же демо-данными, что раньше были захардкожены в src/data.ts фронта. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final TaskRepository tasks;
    private final TaskResponseRepository responses;
    private final ParticipationRepository participations;
    private final ChatRepository chats;
    private final FoundationRepository foundations;

    public DataSeeder(UserRepository users, TaskRepository tasks, TaskResponseRepository responses,
                      ParticipationRepository participations, ChatRepository chats,
                      FoundationRepository foundations) {
        this.users = users;
        this.tasks = tasks;
        this.responses = responses;
        this.participations = participations;
        this.chats = chats;
        this.foundations = foundations;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        User alexey = users.save(new User("Алексей Иванов", "alexey@mail.ru", "+7 999 123-45-67",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Москва", LocalDate.of(2025, 4, 12), 48, true));
        User maria = users.save(new User("Мария Петрова", "m.petrova@mail.ru", "+7 999 123-45-68",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Москва", LocalDate.of(2025, 4, 20), 32, true));
        User igor = users.save(new User("Игорь Сидоров", "igor.s@mail.ru", "+7 999 123-45-69",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Санкт-Петербург", LocalDate.of(2025, 4, 22), 27, true));
        User anna = users.save(new User("Анна Смирнова", "anna.sm@mail.ru", "+7 999 123-45-70",
                encoder.encode("123456"), User.ROLE_VOLUNTEER, "Казань", LocalDate.of(2025, 5, 2), 15, false));
        users.save(new User("Администратор", "admin@dobro.ru", "+7 999 000-00-01",
                encoder.encode("admin123"), User.ROLE_ADMIN, "Москва", LocalDate.of(2025, 1, 10), 0, true));
        users.save(new User("Фонд «Добрые лапы»", "fond@lapy.ru", "+7 999 000-00-02",
                encoder.encode("fond123"), User.ROLE_FOUNDATION, "Москва", LocalDate.of(2025, 2, 1), 0, true));

        Task t1 = task("Помощь приюту для животных",
                "Приглашаем волонтёров помочь в приюте для животных. Ваша помощь очень нужна: прогулки с собаками, уход за животными, уборка территории.",
                List.of("Привести с собой хорошее настроение", "Пройти с собачками", "Помочь с уборкой вольеров"),
                "offline", "one", "Животные", "Москва", "12 мая", "18 мая", 20, 14, "🐕",
                "linear-gradient(135deg, #FFE9B8 0%, #FFD66B 100%)", "Фонд «Добрые лапы»", "moderation");
        Task t2 = task("Сбор гуманитарной помощи",
                "Нужна помощь в сборе и сортировке гуманитарной помощи для семей в трудной ситуации. Работа на складе, по желанию — разгрузка машин.",
                List.of("Сортировка собранных вещей", "Упаковка наборов", "Работа в команде с координатором"),
                "offline", "regular", "Соц. помощь", "Зеленоград", "15 мая", "22 мая", 10, 6, "📦",
                "linear-gradient(135deg, #E3ECFF 0%, #B8CCF5 100%)", "Фонд «Весть»", "published");
        Task t3 = task("Онлайн-консультации для детей",
                "Бесплатные онлайн-консультации для детей из малообеспеченных семей. Нужны волонтёры-наставники для поддержки в учёбе и развитии.",
                List.of("Проводить занятия 2 раза в неделю", "Коммуникабельность и терпение", "Удобное рабочее место с камерой"),
                "online", "regular", "Дети", "Онлайн", "14 мая", "16 мая", 15, 8, "💻",
                "linear-gradient(135deg, #DFF7E7 0%, #B5EAC4 100%)", "Дельта с друзьями", "rework");
        Task t4 = task("Экологическая акция «Чистый парк»",
                "Убираем мусор в городских парках и лесах. Нужны активные волонтёры: пакеты, перчатки и хорошее настроение мы предоставим.",
                List.of("Принести удобную одежду", "Работать в команде от 2 часов", "Следовать инструкциям координатора"),
                "offline", "one", "Экология", "Санкт-Петербург", "20 мая", "30 мая", 30, 12, "🌿",
                "linear-gradient(135deg, #E5F7E0 0%, #C4E9B5 100%)", "Зелёный мир", "moderation");
        Task t5 = task("Поддержка пожилых людей",
                "Позвоните, навестите или просто пообщайтесь с пожилыми людьми, которым не хватает внимания. Разговоры, помощь по дому, прогулки.",
                List.of("Аккуратность и доброжелательность", "Свободное время 1–2 раза в неделю", "Готовность к регулярным визитам"),
                "offline", "regular", "Соц. помощь", "Москва", "15 мая", "30 мая", 12, 5, "💛",
                "linear-gradient(135deg, #FFF0D1 0%, #FFDFA6 100%)", "Забота", "published");
        tasks.saveAll(List.of(t1, t2, t3, t4, t5));

        // Отклики Алексея (страница «Мои отклики»)
        respond(t1, alexey, "approved", LocalDate.of(2025, 5, 12));
        respond(t3, alexey, "pending", LocalDate.of(2025, 5, 14));
        respond(t4, alexey, "pending", LocalDate.of(2025, 5, 20));

        // История выполненных заданий + данные для аналитики за последние месяцы
        participations.save(new Participation(t2, alexey, LocalDate.of(2025, 5, 4), 6));
        participations.save(new Participation(t3, alexey, LocalDate.of(2025, 5, 2), 4));
        participations.save(new Participation(t4, alexey, LocalDate.of(2025, 4, 25), 3));

        LocalDate now = LocalDate.now();
        LocalDate m0 = now.withDayOfMonth(1);
        participations.save(new Participation(t1, maria, m0.minusMonths(4), 5));
        participations.save(new Participation(t2, maria, m0.minusMonths(3), 6));
        participations.save(new Participation(t5, maria, m0.minusMonths(2), 4));
        participations.save(new Participation(t1, maria, m0.minusMonths(2).plusDays(3), 3));
        participations.save(new Participation(t4, maria, m0.minusMonths(1), 4));
        participations.save(new Participation(t2, maria, m0.minusDays(2), 5));
        participations.save(new Participation(t3, igor, m0.minusMonths(3).plusDays(5), 4));
        participations.save(new Participation(t4, igor, m0.minusMonths(3).plusDays(9), 3));
        participations.save(new Participation(t5, igor, m0.minusMonths(1).plusDays(4), 5));
        participations.save(new Participation(t1, igor, m0.minusDays(1), 4));
        participations.save(new Participation(t4, anna, m0.minusMonths(4).plusDays(6), 3));
        participations.save(new Participation(t3, anna, m0.minusMonths(1).plusDays(8), 2));

        // Диалоги Алексея
        chat(alexey, "Фонд «Добрые лапы»",
                msg(ChatMessage.FROM_THEM, "Здравствуйте! Видим ваш отклик на задание «Помощь приюту для животных».", "12:42"),
                msg(ChatMessage.FROM_THEM, "Подскажите, вы можете быть 12 мая с 10:00 до 16:00?", "12:43"),
                msg(ChatMessage.FROM_ME, "Здравствуйте! Да, буду весь день.", "12:58"),
                msg(ChatMessage.FROM_THEM, "Оставьте на ваше участие! Ждём вас в приюте 🐾", "13:00"));
        chat(alexey, "Фонд «Доброе сердце»",
                msg(ChatMessage.FROM_THEM, "Спасибо за ваш отклик! Разрешите направить вам дополнительное задание.", "11:20"),
                msg(ChatMessage.FROM_ME, "Да, всё выполнил! Проект очень полезный.", "11:34"),
                msg(ChatMessage.FROM_THEM, "Отлично, подтверждаем выполнение и начислим часы.", "11:35"));
        chat(alexey, "Портал «Лига привилегий»",
                msg(ChatMessage.FROM_THEM, "9 бонусных часов начислено за задание «Сбор гуманитарной помощи».", "Вчера"));
        chat(alexey, "Фонд «Дети и будущее»",
                msg(ChatMessage.FROM_THEM, "Отличная работа! Но направление по детям на эту дату отклонено, попробуйте другую дату.", "Вчера"));
        chat(alexey, "Администратор",
                msg(ChatMessage.FROM_THEM, "Добро пожаловать на платформу «Помогать проСТО»! Заполните профиль, чтобы получать подходящие задания.", "Пн"));

        foundations.saveAll(List.of(
                new Foundation("Фонд «Добрые лапы»", "7701234567", "pending"),
                new Foundation("Фонд «Весть»", "7702345678", "approved"),
                new Foundation("Дельта с друзьями", "7803456789", "pending"),
                new Foundation("Зелёный мир", "7804567890", "approved"),
                new Foundation("Забота", "7705678901", "rejected")
        ));
    }

    private Task task(String title, String description, List<String> duties, String format, String duration,
                      String category, String location, String dateFrom, String dateTo, int slots, int responses,
                      String emoji, String gradient, String organizer, String adminStatus) {
        Task t = new Task();
        t.title = title;
        t.description = description;
        t.duties.addAll(duties);
        t.format = format;
        t.duration = duration;
        t.category = category;
        t.location = location;
        t.dateFrom = dateFrom;
        t.dateTo = dateTo;
        t.slots = slots;
        t.responses = responses;
        t.emoji = emoji;
        t.gradient = gradient;
        t.organizer = organizer;
        t.adminStatus = adminStatus;
        return tasks.save(t);
    }

    private void respond(Task task, User user, String status, LocalDate createdAt) {
        TaskResponse r = new TaskResponse();
        r.task = task;
        r.user = user;
        r.status = status;
        r.createdAt = createdAt;
        responses.save(r);
    }

    private void chat(User owner, String name, ChatMessage... messages) {
        Chat chat = new Chat();
        chat.user = owner;
        chat.name = name;
        chats.save(chat);
        for (ChatMessage m : messages) {
            chat.messages.add(m);
            m.chat = chat;
        }
        chats.save(chat);
    }

    private ChatMessage msg(String from, String text, String time) {
        return new ChatMessage(null, from, text, time);
    }
}
