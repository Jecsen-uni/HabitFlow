# Presentasi: HabitFlow

## Slide 1: First Page

HabitFlow - Aplikasi Habit Tracker.

Proyek Software Architecture berbasis NestJS, PostgreSQL, Clean Architecture, dan microservice-style boundaries.

## Slide 2: Team

Pembagian tanggung jawab:

- Backend Architecture: NestJS module, controller, service, repository contract, dan business rules.
- Database & Infrastructure: schema PostgreSQL, repository implementation, Docker Compose, dan `.env`.
- Frontend/UI: browser dashboard, responsive mobile layout, dark mode, dan Bahasa Indonesia.
- Dokumentasi & Testing: README, report, PPT, architecture theory, Jest tests, dan GitHub.

## Slide 3: Tech Stack

- Backend: NestJS, TypeScript, Node.js.
- Database: PostgreSQL, node-postgres.
- Validasi: Zod.
- Testing: Jest dan ts-jest.
- Frontend: HTML, CSS, JavaScript, dan Flutter source.
- DevOps: Docker Compose dan `.env`.
- Version Control: Git dan GitHub.

## Slide 4: Latar Belakang

Banyak orang memulai kebiasaan baru, tetapi sulit menjaga konsistensi karena jadwal, progres, dan riwayat tidak terlihat jelas.

Poin masalah:

- User perlu melihat habit yang harus dilakukan hari ini.
- User perlu riwayat yang tetap tersimpan meskipun habit dihapus.
- User perlu motivasi melalui streak, journey, dan achievement.

## Slide 5: Solusi

HabitFlow menyediakan:

- Habit regular, negative habit, dan one-time todo.
- Calendar/today page untuk melihat jadwal harian.
- Journey template untuk langsung memakai paket habit.
- History calendar dengan popup detail tanggal.
- Achievement milestone untuk finished habit, perfect days, dan day streaks.
- Soft delete agar riwayat lama tidak hilang.

## Slide 6: Penjelasan Design Pattern

- Repository Pattern: `HabitRepository` memisahkan business logic dari detail PostgreSQL atau memory storage.
- Dependency Injection: `src/app.ts` memakai NestJS providers untuk inject repository ke service.
- Controller Pattern: NestJS controller menerjemahkan HTTP request menjadi service call.
- DTO / Validation Pattern: Zod schema memvalidasi request sebelum masuk ke service layer.
- Entity Pattern: `Habit` dan `HabitLog` menjaga aturan domain dasar.
- Service Layer Pattern: `HabitService` dan `AuthService` menyimpan alur use case dan business rules.

## Slide 7: Penjelasan Architecture yang Digunakan

Architecture style: microservice-style Clean Architecture.

Layer:

- Domain: entity dan repository contract di `src/domain`.
- Application: business rules dan use case di `src/application/services`.
- Presentation: NestJS controller, filter, dan validator di `src/presentation`.
- Infrastructure: PostgreSQL dan memory repository di `src/infrastructure`.

Alasan:

- Dependency direction jelas: Presentation -> Application -> Domain.
- NestJS dan PostgreSQL menjadi outer-layer detail.
- API boundary, bounded capability, konfigurasi mandiri, dan repository abstraction mendukung prinsip microservice.
- Dapat dipisah menjadi Habit Service, Auth Service, dan Notification Service di masa depan.

## Slide 8: Konklusi

HabitFlow memenuhi requirement proyek karena:

- Menggunakan NestJS sebagai framework utama.
- Menerapkan architecture style yang jelas.
- Mengimplementasikan design pattern.
- Menyediakan source code GitHub, dokumentasi, report, PPT, testing, dan frontend demo.

GitHub: `https://github.com/Jecsen-uni/HabitFlow`

