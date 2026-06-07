# HabitFlow Project Report

## 1. Project Introduction

HabitFlow is a habit tracker application designed to help users plan, complete, and evaluate personal habits. The system supports regular repeated habits, negative habits, and one-time todo quests. Users can view daily schedules, apply recommended journey templates, inspect historical progress, and unlock achievement milestones.

This project focuses on backend software architecture. The frontend is intentionally simple and is used to demonstrate the backend workflows through a browser dashboard and Flutter source code.

## 2. Problem Statement

Many users start personal improvement routines but lose consistency because they cannot clearly see what must be done today, what was completed before, and how their progress develops over time. HabitFlow solves this by combining scheduling, habit logs, streak tracking, history, and achievements in one application.

## 3. Project Objectives

- Build a backend application using NestJS as the main framework.
- Apply software architecture principles and design patterns.
- Provide a clear REST API for habit tracking features.
- Store habit definitions and history using PostgreSQL-ready persistence.
- Keep the backend testable by separating business logic from HTTP and database code.
- Provide simple frontend screens for demonstration.
- Document architecture decisions and theory implementation.

## 4. Technology Stack

| Area | Technology |
| --- | --- |
| Backend Framework | NestJS |
| Language | TypeScript |
| Runtime | Node.js |
| Database | PostgreSQL |
| Database Driver | node-postgres (`pg`) |
| Validation | Zod |
| Security Middleware | Helmet |
| Environment Configuration | dotenv |
| Testing | Jest, ts-jest |
| Frontend Demo | HTML, CSS, JavaScript |
| Mobile Source | Flutter |
| DevOps | Docker Compose |
| Version Control | Git and GitHub |

## 5. Selected Architecture Style

The selected architecture style is microservice-style Clean Architecture.

HabitFlow is currently delivered as one backend service for project simplicity, but the internal structure follows microservice principles:

- REST API boundary for external clients.
- Separate business capability modules for Habit and Auth.
- Independent environment configuration.
- Database access hidden behind repository contracts.
- Health endpoint for service monitoring.
- Business logic tested independently from HTTP and PostgreSQL.

Natural future microservice candidates are:

- Habit Service: habit CRUD, schedules, logs, journeys, achievements.
- Auth Service: registration, login, token/session handling.
- Notification Service: reminder delivery based on habit reminder times.

## 6. Architecture Overview

The backend applies Clean Architecture with four main layers:

| Layer | Responsibility | Files |
| --- | --- | --- |
| Domain | Core entities and repository contracts | `src/domain/entities`, `src/domain/repositories/HabitRepository.ts` |
| Application | Business rules and use cases | `src/application/services/HabitService.ts`, `src/application/services/AuthService.ts` |
| Infrastructure | Database and persistence implementation | `src/infrastructure/repositories`, `src/infrastructure/database` |
| Presentation | NestJS controllers, filters, validators | `src/presentation/controllers`, `src/presentation/filters`, `src/presentation/validators` |

Dependency direction:

```text
Presentation -> Application -> Domain
Infrastructure -> Domain
```

The composition root is `src/app.ts`, where NestJS wires controllers, services, and repository implementations.

## 7. Design Patterns Implemented

### Repository Pattern

Implemented in:

- `src/domain/repositories/HabitRepository.ts`
- `src/infrastructure/repositories/PostgresHabitRepository.ts`
- `src/infrastructure/repositories/InMemoryHabitRepository.ts`

Purpose:

- Hide persistence details from business logic.
- Allow PostgreSQL and memory storage to be swapped.
- Make tests easier to run without a database.

### Dependency Injection

Implemented in:

- `src/app.ts`
- `src/application/services/HabitService.ts`
- `src/presentation/controllers/HabitController.ts`

Purpose:

- Reduce coupling.
- Make services testable.
- Let NestJS inject dependencies through providers and factory providers.

### Controller Pattern

Implemented in:

- `src/presentation/controllers/HabitController.ts`
- `src/presentation/controllers/AuthController.ts`
- `src/presentation/controllers/HealthController.ts`

Purpose:

- Translate HTTP requests into service calls.
- Keep HTTP logic separate from business rules.

### DTO and Validation Pattern

Implemented in:

- `src/presentation/validators/habitSchemas.ts`
- `src/presentation/validators/authSchemas.ts`

Purpose:

- Validate incoming data before it reaches the service layer.
- Return consistent validation errors.

### Entity Pattern

Implemented in:

- `src/domain/entities/Habit.ts`
- `src/domain/entities/HabitLog.ts`

Purpose:

- Centralize important domain validation.
- Prevent invalid habit or log objects.

### Service Layer Pattern

Implemented in:

- `src/application/services/HabitService.ts`
- `src/application/services/AuthService.ts`

Purpose:

- Coordinate use cases.
- Enforce business rules such as scheduling, streaks, negative habits, soft deletion, and achievements.

## 8. System Flow

1. User interacts with the browser dashboard or Flutter source.
2. Frontend calls NestJS REST endpoints.
3. NestJS controller validates request data using Zod.
4. Controller calls the application service.
5. Service applies business rules.
6. Service uses `HabitRepository` instead of direct SQL.
7. Repository implementation stores or retrieves data.
8. Controller returns a JSON response.

## 9. Main Features

- Login and register with username, email, and password.
- Create regular, negative, and one-time todo habits.
- Set start date, end date, schedule days, and reminder time.
- Edit and soft-delete habits.
- Preserve past history after deletion.
- Mark and unmark failed negative habits.
- Calendar/today page.
- Journey template plans.
- History calendar with date detail popup.
- Achievement milestone system.
- Profile settings, dark mode, and Indonesian language.

## 10. Project Evaluation

The project satisfies the course requirements because it:

- Uses NestJS as the main backend framework.
- Applies Clean Architecture and microservice-style boundaries.
- Implements multiple design patterns.
- Provides GitHub-ready source code and README.
- Provides project documentation and presentation materials.
- Includes backend tests for business rules.
- Includes a simple frontend demonstration.

## 11. Testing

Tests are implemented in `tests/HabitService.test.ts`.

Covered behavior:

- Habit not found errors.
- Completion requires an existing habit.
- Future regular habits cannot be completed early.
- Future todo habits can be completed.
- Deleting a habit preserves prior history.
- Negative habits do not count as finished before the day ends.
- Monthly history boundaries are correct.

## 12. Conclusion

HabitFlow demonstrates a backend application with clear architecture, practical design patterns, and maintainable code boundaries. The project is suitable for explaining software architecture concepts because each layer and pattern can be traced directly to source code.

