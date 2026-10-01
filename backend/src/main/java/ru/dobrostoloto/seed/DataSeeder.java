package ru.dobrostoloto.seed;

import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.dobrostoloto.user.User;
import ru.dobrostoloto.user.UserRepository;

/**
 * При старте создаёт только демо-аккаунты. Фонды, задания, отклики и диалоги
 * не заполняются — контент создаётся пользователями через интерфейс.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;

    public DataSeeder(UserRepository users) {
        this.users = users;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) {
            return;
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // id = 1, fallback для гостей (CurrentUser.DEMO_USER_ID)
        users.save(new User("Алексей Иванов", "alexey@mail.ru", "+7 999 123-45-67",
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

        users.save(new User("Фонд «Добрые лапы»", "fond@lapy.ru", "+7 999 000-00-02",
                encoder.encode("fond123"), User.ROLE_FOUNDATION, "Москва", LocalDate.of(2025, 2, 1), 0, true));
    }
}
