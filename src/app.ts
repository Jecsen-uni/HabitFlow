import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AuthService } from "./application/services/AuthService";
import { HabitService } from "./application/services/HabitService";
import { env } from "./config/env";
import { HabitRepository } from "./domain/repositories/HabitRepository";
import { pool } from "./infrastructure/database/postgresPool";
import { InMemoryHabitRepository } from "./infrastructure/repositories/InMemoryHabitRepository";
import { PostgresHabitRepository } from "./infrastructure/repositories/PostgresHabitRepository";
import { AuthController } from "./presentation/controllers/AuthController";
import { HealthController } from "./presentation/controllers/HealthController";
import { HabitController } from "./presentation/controllers/HabitController";
import { AppExceptionFilter } from "./presentation/filters/AppExceptionFilter";

const HABIT_REPOSITORY = Symbol("HABIT_REPOSITORY");

@Module({
  controllers: [AuthController, HabitController, HealthController],
  providers: [
    {
      provide: HABIT_REPOSITORY,
      useFactory: (): HabitRepository =>
        env.DATABASE_URL === "memory" ? new InMemoryHabitRepository() : new PostgresHabitRepository(pool)
    },
    {
      provide: HabitService,
      useFactory: (habitRepository: HabitRepository) => new HabitService(habitRepository),
      inject: [HABIT_REPOSITORY]
    },
    {
      provide: AuthService,
      useFactory: () => new AuthService()
    }
  ]
})
export class AppModule {}

export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({ origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",") });
  app.useStaticAssets("public");
  app.useGlobalFilters(new AppExceptionFilter());

  return app;
}
