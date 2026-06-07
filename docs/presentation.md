# Presentation: Habit Tracker App

## Slide 1: Title

Habit Tracker App

Backend-focused software architecture project using Flutter/browser UI, NestJS, PostgreSQL, Clean Architecture, and microservice-style boundaries.

## Slide 2: Team and Responsibility

Suggested responsibility split:
- Backend Architecture: NestJS module structure, services, controllers, repositories.
- Database and Infrastructure: PostgreSQL schema, repository implementation, environment configuration.
- Frontend/UI: browser dashboard, responsive layout, dark mode, Indonesian language option.
- Documentation and Testing: report, presentation, README, unit tests, GitHub submission.

## Slide 3: Problem

People often start habits but fail to track consistency. This app helps users create habits, mark completions, and monitor progress.

## Slide 4: Objective

Project objectives:
- Build a backend application using NestJS.
- Apply a clear software architecture style.
- Apply design patterns in real source code.
- Provide backend API, simple frontend, report, presentation, and GitHub repository.

## Slide 5: Solution

A simple habit tracker with:
- Regular habits, negative habits, and one-time todo quests.
- Calendar scheduling with start and end dates.
- Completion history and date detail popup.
- Journey templates.
- Dark mode, Indonesian language option, profile settings, and achievement milestones.

## Slide 6: Technology Stack

- Flutter for simple frontend.
- NestJS and TypeScript for backend API.
- PostgreSQL for relational data storage.
- Jest for backend unit tests.
- Zod for DTO validation.

## Slide 7: Architecture Style

Microservice-style Clean Architecture with NestJS as the main framework.

## Slide 8: Software Architecture

The backend applies Clean Architecture:
- Domain layer.
- Application layer.
- Infrastructure layer.
- Presentation layer.

It is one deployable service with microservice-style principles:
- REST API boundary.
- Environment-based configuration.
- Isolated Habit and Auth service modules.
- Replaceable persistence.

## Slide 9: Design Patterns

- Repository Pattern.
- Dependency Injection.
- Controller Pattern.
- DTO and Validation Pattern.
- Entity Pattern.
- Service Layer Pattern.

## Slide 10: System Flow

Workflow:
1. User uses browser/Flutter frontend.
2. Frontend calls NestJS REST API.
3. NestJS controller validates request body.
4. Application service applies business rules.
5. Repository saves or reads data.
6. API returns JSON response.

## Slide 11: Database Design

Main tables:
- `habits`
- `habit_logs`

The `habit_logs` table prevents duplicate completions for the same habit and date.

## Slide 12: API Design

Example endpoints:
- `GET /api/habits`
- `POST /api/habits`
- `POST /api/habits/:id/logs`
- `GET /api/habits/stats`
- `GET /api/habits/history/day?date=YYYY-MM-DD`

## Slide 13: Project Evaluation

Evaluation:
- NestJS requirement is satisfied.
- Architecture style is documented and justified.
- Patterns are implemented and mapped to source files.
- Tests verify core business rules.
- GitHub repository contains source code, README, docs, PPT, and report.

## Slide 14: Benefits of Architecture

- Easier testing.
- Clear separation of responsibilities.
- Database implementation can be changed with minimal impact.
- Business logic is not mixed with HTTP or SQL code.
- Service modules can later be split into independent microservices.

## Slide 15: Documentation

Submitted documentation:
- `README.md`: project setup and run guide.
- `.env.example`: environment variable template and explanation.
- `docs/documentation.md`: app documentation.
- `docs/architecture-and-theory.md`: theory explanation and implementation mapping.
- `docs/project-report.md` and `docs/Project_Report_HabitFlow.docx`: project report.

## Slide 16: Lessons Learned

Lessons learned:
- Architecture decisions should be checked against the rubric early.
- Clean Architecture keeps migration from Express-style routing to NestJS controllers manageable.
- Repository Pattern makes backend logic easier to test.
- Documentation should map theory directly to code.

## Slide 17: Conclusion

The project demonstrates a practical full-stack habit tracker while focusing on backend architecture, clean code boundaries, and maintainable design patterns.
