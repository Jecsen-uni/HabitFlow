# Habit Tracker App

Backend-focused habit tracker project using NestJS, PostgreSQL, Clean Architecture, microservice-style service boundaries, and a simple Flutter/browser frontend.

GitHub repository:

```text
https://github.com/Jecsen-uni/HabitFlow
```

## Project Structure

```text
src/
  application/      Use cases and services
  domain/           Entities and repository interfaces
  infrastructure/   PostgreSQL implementation
  presentation/     NestJS controllers, exception filters, validators
mobile/             Simple Flutter frontend
migrations/         PostgreSQL schema
docs/               Documentation and presentation outline
```

## Architecture and Design Patterns

The backend is structured as one deployable service with microservice-style boundaries:

- REST API boundary for external clients.
- Clean Architecture layers.
- Repository Pattern for persistence abstraction.
- Dependency Injection from `src/app.ts`.
- Controller Pattern using NestJS decorators for HTTP request handling.
- DTO/Validation Pattern with Zod.
- Entity and Service Layer patterns for business rules.

Full theory explanation and file-by-file implementation mapping:

```text
docs/architecture-and-theory.md
```

Project report deliverables:

```text
docs/project-report.md
docs/Project_Report_HabitFlow.docx
```

Presentation deliverable:

```text
docs/Habit_Tracker_Presentation.pptx
docs/presentation.md
```

## Project Collection Checklist

- GitHub link and README: this repository.
- Backend project: `src/`, `package.json`, `migrations/`, `.env.example`.
- Project report: `docs/Project_Report_HabitFlow.docx`.
- Project presentation: `docs/Habit_Tracker_Presentation.pptx`.
- Documentation: `docs/documentation.md` and `docs/architecture-and-theory.md`.
- Frontend demo: `public/index.html`.
- Flutter source: `mobile/`.

## Run Backend

For a quick in-memory demo without PostgreSQL:

```powershell
$env:DATABASE_URL="memory"
$env:CORS_ORIGIN="*"
npm.cmd run dev
```

With PostgreSQL and Docker installed:

```powershell
docker compose up -d
```

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run migrate
npm.cmd run dev
```

The API runs on `http://localhost:3000`.
The browser dashboard is served from `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` for local configuration. The real `.env` file is ignored by Git.

```powershell
Copy-Item .env.example .env
```

Use `DATABASE_URL=memory` for a fast demo without PostgreSQL, or use the PostgreSQL URL from `.env.example` for database-backed mode.

## Run Tests

```powershell
npm.cmd test
```

## Flutter Frontend

Install Flutter SDK, then:

```powershell
Set-Location mobile
flutter pub get
flutter run
```

For Android emulator, the API base URL is `http://10.0.2.2:3000/api`.
