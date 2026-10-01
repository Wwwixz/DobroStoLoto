package ru.dobrostoloto.user;

import java.time.format.DateTimeFormatter;

/** Формат ответа профиля — поля, которые использует страница «Профиль». */
public record UserDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String city,
        String role,
        String registeredAt,
        int hours
) {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    public static UserDto from(User u) {
        return new UserDto(
                u.id,
                u.fullName,
                u.email,
                u.phone,
                u.city,
                u.role,
                u.registeredAt.format(DATE),
                u.hours
        );
    }
}
