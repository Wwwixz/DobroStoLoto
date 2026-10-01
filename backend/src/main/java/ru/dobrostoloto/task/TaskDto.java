package ru.dobrostoloto.task;

import java.util.List;

/** Полностью повторяет интерфейс Task из src/data.ts фронта. */
public record TaskDto(
        Long id,
        String title,
        String description,
        List<String> duties,
        String format,
        String duration,
        String category,
        String location,
        String dateFrom,
        String dateTo,
        int slots,
        int responses,
        String emoji,
        String gradient,
        String organizer,
        boolean responded
) {

    public static TaskDto from(Task t, boolean responded) {
        return new TaskDto(
                t.id, t.title, t.description, List.copyOf(t.duties), t.format, t.duration,
                t.category, t.location, t.dateFrom, t.dateTo, t.slots, t.responses,
                t.emoji, t.gradient, t.organizer, responded
        );
    }
}
