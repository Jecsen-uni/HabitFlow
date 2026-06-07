# HabitFlow Architecture and Theory

This document explains the software architecture, design patterns, and theory implemented in HabitFlow. It also points to the exact files where each concept appears.

## Architecture Summary

HabitFlow is implemented as a backend-focused service using NestJS, TypeScript, PostgreSQL, and a simple frontend. The backend follows Clean Architecture and microservice-style service boundaries.

The current project is one deployable backend service, not multiple independently deployed microservices. It still applies microservice principles: a clear API boundary, isolated business capabilities, environment-based configuration, persistence abstraction, and independently testable service modules. The code is prepared so the Habit and Auth capabilities can be split into separate services later if required.

## Layered Clean Architecture

Dependency direction:

```text
Presentation -> Application -> Domain
Infrastructure -> Domain
```

The important rule is that the business logic does not depend on NestJS or PostgreSQL. Frameworks and databases are outer-layer details.

| Layer | Responsibility | Implemented In |
| --- | --- | --- |
| Domain | Core entities and repository contracts | `src/domain/entities/Habit.ts`, `src/domain/entities/HabitLog.ts`, `src/domain/repositories/HabitRepository.ts` |
| Application | Business use cases and workflows | `src/application/services/HabitService.ts`, `src/application/services/AuthService.ts` |
| Infrastructure | Database and persistence implementations | `src/infrastructure/repositories/PostgresHabitRepository.ts`, `src/infrastructure/repositories/InMemoryHabitRepository.ts`, `src/infrastructure/database/postgresPool.ts` |
| Presentation | HTTP controllers, exception filters, and request validation | `src/presentation/controllers/HabitController.ts`, `src/presentation/controllers/AuthController.ts`, `src/presentation/controllers/HealthController.ts`, `src/presentation/filters/AppExceptionFilter.ts`, `src/presentation/validators` |
| Composition Root | Wires concrete dependencies together | `src/app.ts` |

## Microservice Architecture Principles

HabitFlow is structured as a microservice-style backend service.

| Microservice Principle | How HabitFlow Applies It | Code Location |
| --- | --- | --- |
| API boundary | External clients communicate through NestJS REST controllers only | `src/presentation/controllers/HabitController.ts`, `src/presentation/controllers/AuthController.ts` |
| Business capability ownership | Habit tracking and authentication are separated into service modules | `HabitService.ts`, `AuthService.ts` |
| Database encapsulation | Application logic uses repository contracts instead of direct SQL | `HabitRepository.ts`, `PostgresHabitRepository.ts` |
| Independent configuration | Runtime behavior is controlled through environment variables | `.env.example`, `src/config/env.ts` |
| Replaceable infrastructure | Memory storage and PostgreSQL can be swapped without changing use cases | `src/app.ts`, `InMemoryHabitRepository.ts`, `PostgresHabitRepository.ts` |
| Health endpoint | Service exposes a lightweight operational health check | `src/presentation/controllers/HealthController.ts` at `GET /health` |
| Testable service boundary | Business logic is tested through service/repository boundaries | `tests/HabitService.test.ts` |

If this project were split into multiple microservices, natural service candidates would be:

- Habit Service: habit CRUD, schedule calculation, streaks, achievements, journey templates.
- Auth Service: user registration, login, session/token issuing.
- Notification Service: reminder delivery from stored reminder times.

The current modular structure keeps those boundaries clear while avoiding extra deployment complexity for a student project.

## Design Patterns Implemented

### Repository Pattern

Repository Pattern hides persistence details behind an interface.

Implemented in:

- Interface: `src/domain/repositories/HabitRepository.ts`
- PostgreSQL implementation: `src/infrastructure/repositories/PostgresHabitRepository.ts`
- In-memory implementation: `src/infrastructure/repositories/InMemoryHabitRepository.ts`

Benefit:

- `HabitService` does not know whether data comes from PostgreSQL or memory.
- Tests can run without PostgreSQL.
- Database implementation can change with limited impact.

### Dependency Injection

Dependency Injection passes required dependencies from the outside instead of creating them inside business classes.

Implemented in:

- `src/application/services/HabitService.ts`: constructor receives `HabitRepository`.
- `src/presentation/controllers/HabitController.ts`: constructor receives `HabitService`.
- `src/app.ts`: creates concrete repositories, services, and controllers.

Benefit:

- Lower coupling.
- Easier unit testing.
- Infrastructure can be replaced without rewriting use cases.

### Controller Pattern

Controllers translate HTTP requests into application service calls.

Implemented in:

- `src/presentation/controllers/HabitController.ts`
- `src/presentation/controllers/AuthController.ts`
- `src/presentation/controllers/HealthController.ts`

Example:

- `HabitController.create` validates the request body and calls `HabitService.createHabit`.
- `HabitController.complete` validates a habit log request and calls `HabitService.completeHabit`.

Benefit:

- HTTP-specific code stays out of business logic.
- Services can be reused by another frontend or API layer.

NestJS implementation detail:

- Controllers use `@Controller`, `@Get`, `@Post`, `@Patch`, and `@Delete` decorators.
- The NestJS module/composition root is in `src/app.ts`.

### DTO and Validation Pattern

DTO and validation logic ensure data entering the application has the correct shape.

Implemented in:

- `src/presentation/validators/habitSchemas.ts`
- `src/presentation/validators/authSchemas.ts`

Tool used:

- Zod schema validation.

Benefit:

- Invalid requests are rejected before reaching the business layer.
- Error handling is consistent.

### Entity Pattern

Entities represent domain objects and enforce core invariants.

Implemented in:

- `src/domain/entities/Habit.ts`
- `src/domain/entities/HabitLog.ts`

Examples:

- Habit title cannot be empty.
- Habit target count must be at least 1.
- Habit log date must use `YYYY-MM-DD`.

Benefit:

- Core domain rules are centralized.
- Invalid domain objects are harder to create.

### Service Layer Pattern

The service layer coordinates use cases and business rules.

Implemented in:

- `src/application/services/HabitService.ts`
- `src/application/services/AuthService.ts`

Important HabitService rules:

- Regular habits can be completed only on current or past dates.
- Future regular or negative habits cannot be completed early.
- One-time todo habits can be completed for future dates.
- Negative habits count as finished only after the day passes if they were not marked failed.
- Deleting a habit is a soft delete that preserves past completion history.
- History achievements use lifetime totals.

Benefit:

- Business behavior is easy to find and test.
- Controllers stay thin.

### Strategy-Like Persistence Selection

The app chooses a persistence implementation at runtime based on `DATABASE_URL`.

Implemented in:

- `src/app.ts`

Behavior:

- `DATABASE_URL=memory` uses `InMemoryHabitRepository`.
- Any other database URL uses `PostgresHabitRepository`.

Benefit:

- Fast demo mode without PostgreSQL.
- Real PostgreSQL mode for production-style persistence.

## Environment Configuration

Environment variables are documented in `.env.example`.

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | NestJS HTTP server port | `3000` |
| `NODE_ENV` | Runtime mode | `development` |
| `DATABASE_URL` | Storage backend | `memory` or `postgres://postgres:postgres@localhost:5432/habit_tracker` |
| `CORS_ORIGIN` | Allowed frontend origins | `*` |

Implementation:

- `.env.example`: developer template.
- `src/config/env.ts`: loads and validates environment variables.

The real `.env` file is intentionally ignored by Git because it may contain secrets or machine-specific settings.

## Database Theory

The app uses relational persistence for habit definitions and logs.

Implemented in:

- `migrations/001_init.sql`
- `src/infrastructure/repositories/PostgresHabitRepository.ts`

Tables:

- `habits`: stores habit definitions, schedule rules, reminder time, active state, and optional end date.
- `habit_logs`: stores per-date status records.

Important database rule:

- `habit_logs` has a unique pair of `habit_id` and `completed_on`, so the same habit cannot create duplicate records for one date.

## Testing Strategy

Tests focus on business logic and architecture boundaries.

Implemented in:

- `tests/HabitService.test.ts`

Covered rules:

- Missing habit returns a not-found error.
- Completing a habit checks that the habit exists.
- Future regular habits cannot be completed.
- Future todo habits can be completed.
- Deleting a habit preserves prior history.
- Negative habits do not count as finished before the day ends.
- Monthly history returns correct month boundaries.

## Frontend Role

The browser frontend is intentionally simple because the project focuses on backend architecture.

Implemented in:

- `public/index.html`

Frontend capabilities:

- Login/register demo session.
- Calendar/today view.
- Habit creation and editing modals.
- Journey templates.
- History calendar and achievements.
- Profile settings, dark mode, and Indonesian language option.

## Architecture Evaluation

The project satisfies the requested architecture/design requirement because it demonstrates:

- Clean Architecture layer separation.
- Microservice-style REST service boundary.
- Repository Pattern.
- Dependency Injection.
- Controller Pattern.
- DTO/Validation Pattern.
- Entity Pattern.
- Service Layer Pattern.
- Environment-based configuration.
- PostgreSQL-ready persistence.
- Unit tests for business rules.
