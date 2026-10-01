# Помогать проСТО (DobroStoLoto)

Волонтёрская платформа: фронтенд на **React 19 + Vite + TypeScript**, бэкенд на **Java 17 + Spring Boot 3.5** (REST API, Spring Data JPA, база H2 в памяти).

## Структура проекта

```
frontend/            — то есть корень репозитория (React + Vite)
  src/
    pages/           — страницы (дашборд, задания, отклики, чаты, админка…)
    lib/api.ts       — API-клиент и хук useApi (все запросы к бэку)
    data.ts          — типы данных (данные теперь приходят с бэка)
backend/             — Spring Boot приложение
  src/main/java/ru/dobrostoloto/
    user/            — регистрация, вход, профиль
    task/            — задания и отклики на них
    respond/         — отклики волонтёров
    chat/            — диалоги с фондами
    history/         — выполненные задания (участия)
    analytics/       — агрегаты для страницы «Аналитика»
    admin/           — модерация заданий, фонды, волонтёры
    seed/            — демо-данные (загружаются при старте)
```

## Запуск

Нужны: **JDK 17+** и **Node.js 18+**. Maven не обязателен — есть wrapper.

**1. Бэкенд** (порт 8080):

```bash
cd backend
./mvnw spring-boot:run        # Linux/macOS
mvnw.cmd spring-boot:run      # Windows
```

**2. Фронтенд** (порт 5173, запросы `/api/*` проксируются на бэкенд):

```bash
npm install   # один раз
npm run dev
```

Открыть http://localhost:5173

## Демо-доступы

| Роль | Логин | Пароль |
|---|---|---|
| Волонтёр | `alexey@mail.ru` | `123456` |
| Администратор | `admin@dobro.ru` | `admin123` |

Также можно зарегистрировать своего пользователя на странице «Регистрация».
Без входа сайт работает под демо-пользователем (Алексей).

## API (основные эндпоинты)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/register` | регистрация (роль, имя, email, пароль) |
| POST | `/api/auth/login` | вход по email/телефону |
| GET | `/api/tasks` | список заданий (фильтры q, category, format, duration) |
| GET | `/api/tasks/{id}` | задание + флаг `responded` текущего пользователя |
| POST / DELETE | `/api/tasks/{id}/respond` | откликнуться / отменить отклик |
| GET | `/api/responses` | мои отклики |
| GET | `/api/chats` | диалоги с сообщениями |
| POST | `/api/chats/{id}/messages` | отправить сообщение |
| GET | `/api/history` | выполненные задания |
| GET | `/api/analytics` | статистика, график по месяцам, категории |
| GET | `/api/profile` | профиль текущего пользователя |
| GET | `/api/admin/tasks` · POST `/api/admin/tasks/{id}/status` | модерация заданий |
| GET | `/api/admin/foundations` · POST `/api/admin/foundations/{id}/status` | модерация фондов |
| GET | `/api/admin/volunteers` | список волонтёров |

Текущий пользователь передаётся заголовком `X-User-Id` (демо-сессия в localStorage).
Пароли хранятся как BCrypt-хэши. База — H2 в памяти, данные сеются заново при каждом
старте; консоль H2 доступна на http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:dobro`, пользователь `sa`).

## Сборка production

```bash
# бэкенд → backend/target/dobro-backend-0.0.1-SNAPSHOT.jar
cd backend && ./mvnw package

# фронтенд → dist/
npm run build
```
