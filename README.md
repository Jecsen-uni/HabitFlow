# Habit Tracker App

Backend-focused habit tracker project using Express.js, PostgreSQL, Clean Architecture, and a simple Flutter frontend.

## Project Structure

```text
src/
  application/      Use cases and services
  domain/           Entities and repository interfaces
  infrastructure/   PostgreSQL implementation
  presentation/     Express controllers, routes, validators
mobile/             Simple Flutter frontend
migrations/         PostgreSQL schema
docs/               Documentation and presentation outline
```

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
