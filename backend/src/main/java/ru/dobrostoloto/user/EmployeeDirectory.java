package ru.dobrostoloto.user;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Замоканная база сотрудников Столото: регистрация волонтёров идёт по
 * корпоративной почте или табельному ID, данные подтягиваются отсюда.
 */
public final class EmployeeDirectory {

    public record Employee(
            String employeeId,
            String corporateEmail,
            String fullName,
            String city,
            String department,
            String position
    ) {
    }

    private static final List<Employee> EMPLOYEES = List.of(
            new Employee("1001", "a.ivanov@stoloto.ru", "Алексей Иванов", "Москва",
                    "IT-департамент", "Ведущий разработчик"),
            new Employee("1002", "m.petrova@stoloto.ru", "Мария Петрова", "Москва",
                    "Департамент маркетинга", "Менеджер по коммуникациям"),
            new Employee("1003", "s.sidorov@stoloto.ru", "Сергей Сидоров", "Санкт-Петербург",
                    "Финансовый департамент", "Аналитик"),
            new Employee("1004", "a.kuznetsova@stoloto.ru", "Анна Кузнецова", "Казань",
                    "Департамент по персоналу", "HR-специалист"),
            new Employee("1005", "d.smirnov@stoloto.ru", "Дмитрий Смирнов", "Москва",
                    "Департамент продукта", "Продакт-менеджер"),
            new Employee("1006", "e.orlova@stoloto.ru", "Екатерина Орлова", "Самара",
                    "Служба поддержки", "Старший оператор"),
            new Employee("1007", "p.novikov@stoloto.ru", "Павел Новиков", "Новосибирск",
                    "IT-департамент", "Тестировщик"),
            new Employee("1008", "o.fedorova@stoloto.ru", "Ольга Фёдорова", "Москва",
                    "Юридический департамент", "Юрист"),
            new Employee("1009", "k.morozov@stoloto.ru", "Кирилл Морозов", "Краснодар",
                    "Департамент продаж", "Менеджер по работе с партнёрами"),
            new Employee("1010", "n.volkova@stoloto.ru", "Наталья Волкова", "Москва",
                    "Департамент маркетинга", "Дизайнер")
    );

    private EmployeeDirectory() {
    }

    /** Ищет сотрудника по корпоративной почте или табельному ID. */
    public static Optional<Employee> findByEmailOrId(String query) {
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }
        String q = query.trim().toLowerCase(Locale.ROOT);
        return EMPLOYEES.stream()
                .filter(e -> e.corporateEmail().equalsIgnoreCase(q) || e.employeeId().equals(q))
                .findFirst();
    }
}
