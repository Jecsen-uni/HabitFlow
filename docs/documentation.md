# Habit Tracker Documentation

## App Overview

Habit Tracker is a simple productivity app for recording recurring habits, negative habits, and one-time tasks from a web dashboard or Flutter client.

Core features:
- Register or log in with an email-based demo session.
- Create regular habits, negative habits, and one-time tasks.
- Schedule habits by weekday and optional reminder time.
- List habits for a specific day.
- Update or delete habits.
- Mark a habit as completed for a date.
- View monthly history, completion stats, achievements, and habit journeys.

## Technology Stack

- Backend: Express.js, TypeScript, PostgreSQL.
- Frontend: simple browser dashboard and Flutter source.
- Validation: Zod.
- Database driver: node-postgres (`pg`).
- Tests: Jest.

## Software Architecture

The backend uses Clean Architecture with layered boundaries and microservice-style service boundaries:

- `domain`: enterprise rules and interfaces. It contains entities and repository contracts.
- `application`: use cases and business workflows. Services depend on repository interfaces, not PostgreSQL.
- `infrastructure`: external details such as PostgreSQL connection and SQL repository implementation.
- `presentation`: Express controllers, routes, and request validators.

Dependency direction points inward:

`presentation -> application -> domain <- infrastructure`

The composition root is `src/app.ts`, where concrete infrastructure is injected into the application service. `DATABASE_URL=memory` injects `InMemoryHabitRepository`; PostgreSQL URLs inject `PostgresHabitRepository`.

For detailed theory and file-by-file implementation mapping, see `docs/architecture-and-theory.md`.

## Design Patterns Applied

- Repository Pattern: `HabitRepository` abstracts persistence. `PostgresHabitRepository` is the concrete implementation.
- Dependency Injection: `HabitService` receives a repository through its constructor.
- DTO and Validation Pattern: Zod schemas validate incoming request data before it reaches application services.
- Controller Pattern: `HabitController` maps HTTP requests to application service calls.
- Entity Pattern: `Habit` and `HabitLog` centralize domain validation.

## API Endpoints

Base URL: `http://localhost:3000/api`

- `GET /habits`: list all habits.
- `POST /habits`: create a habit.
- `GET /habits/day?date=YYYY-MM-DD`: list habits scheduled for a day.
- `GET /habits/history?month=YYYY-MM`: get monthly calendar history.
- `GET /habits/journeys`: list starter habit journey templates.
- `POST /habits/journeys/:id/apply`: create habits from a journey template.
- `GET /habits/stats`: get aggregate progress stats.
- `GET /habits/:id`: get habit detail.
- `PATCH /habits/:id`: update a habit.
- `DELETE /habits/:id?effectiveDate=YYYY-MM-DD`: soft delete a habit from a selected date while preserving previous logs.
- `POST /habits/:id/logs`: mark habit as completed.
- `GET /habits/:id/logs`: list completion logs.

Auth endpoints:

- `POST /auth/register`: create a demo session for an email address.
- `POST /auth/login`: log in with an existing or new email address.
- `GET /auth/me`: return demo API metadata.

Example create habit body:

```json
{
  "title": "Read 10 pages",
  "description": "Read before sleeping",
  "type": "regular",
  "frequency": "daily",
  "targetCount": 1,
  "scheduleDays": [1, 2, 3, 4, 5],
  "startDate": "2026-06-07",
  "reminderTime": "21:00"
}
```

## Database Design

Tables:

- `habits`: stores habit definitions.
- `habit_logs`: stores completion history per date.

`habit_logs` has a unique constraint on `(habit_id, completed_on)` so one habit cannot be completed twice on the same date.

## How to Run

For a fast local demo, set `DATABASE_URL=memory`, install dependencies with `npm.cmd install`, and start the development server with `npm.cmd run dev`. The web dashboard is served from `http://localhost:3000`.

Environment variables are documented in `.env.example`. Copy `.env.example` to `.env` for local development. The real `.env` file should not be committed.

For PostgreSQL:

1. Install PostgreSQL or run `docker compose up -d`.
2. Copy `.env.example` to `.env` and update `DATABASE_URL`.
3. Install dependencies with `npm.cmd install`.
4. Run migrations with `npm.cmd run migrate`.
5. Start development server with `npm.cmd run dev`.
6. Open Flutter project from `mobile/` after Flutter SDK is installed.

## Theory Explanation

Clean Architecture separates business rules from frameworks. In this project, Express and PostgreSQL are replaceable details. The habit use cases are implemented in `HabitService`, which depends only on the `HabitRepository` interface. This makes the code easier to test because services can be tested with a mock repository.

Repository Pattern hides SQL from the application layer. If the database changes from PostgreSQL to another storage engine, the service layer does not need to change as long as the repository interface remains stable.

Dependency Injection improves maintainability by passing dependencies from the outside instead of creating them inside classes. This reduces coupling and supports testing.

Microservice-style architecture in this project means the backend is designed around service boundaries, API contracts, environment configuration, and independent business capabilities. The current implementation is one deployable service for simplicity, but the Habit, Auth, and future Notification capabilities are separated enough to become independent microservices later.
