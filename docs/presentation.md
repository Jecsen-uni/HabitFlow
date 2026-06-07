# Presentation: Habit Tracker App

## Slide 1: Title

Habit Tracker App

Backend-focused software architecture project using Flutter, Express.js, and PostgreSQL.

## Slide 2: Problem

People often start habits but fail to track consistency. This app helps users create habits, mark completions, and monitor progress.

## Slide 3: Solution

A simple habit tracker with:
- Habit management.
- Daily or weekly frequency.
- Completion history.
- Progress statistics.

## Slide 4: Technology Stack

- Flutter for simple frontend.
- Express.js and TypeScript for backend API.
- PostgreSQL for relational data storage.
- Jest for backend unit tests.

## Slide 5: Software Architecture

The backend applies Clean Architecture:
- Domain layer.
- Application layer.
- Infrastructure layer.
- Presentation layer.

## Slide 6: Design Patterns

- Repository Pattern.
- Dependency Injection.
- Controller Pattern.
- DTO and Validation Pattern.
- Entity Pattern.

## Slide 7: Database Design

Main tables:
- `habits`
- `habit_logs`

The `habit_logs` table prevents duplicate completions for the same habit and date.

## Slide 8: API Design

Example endpoints:
- `GET /api/habits`
- `POST /api/habits`
- `POST /api/habits/:id/logs`
- `GET /api/habits/stats`

## Slide 9: Benefits of Architecture

- Easier testing.
- Clear separation of responsibilities.
- Database implementation can be changed with minimal impact.
- Business logic is not mixed with HTTP or SQL code.

## Slide 10: Conclusion

The project demonstrates a practical full-stack habit tracker while focusing on backend architecture, clean code boundaries, and maintainable design patterns.
