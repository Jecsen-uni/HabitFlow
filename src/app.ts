import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import { AuthService } from "./application/services/AuthService";
import { HabitService } from "./application/services/HabitService";
import { env } from "./config/env";
import { pool } from "./infrastructure/database/postgresPool";
import { InMemoryHabitRepository } from "./infrastructure/repositories/InMemoryHabitRepository";
import { PostgresHabitRepository } from "./infrastructure/repositories/PostgresHabitRepository";
import { AuthController } from "./presentation/controllers/AuthController";
import { HabitController } from "./presentation/controllers/HabitController";
import { createAuthRouter } from "./presentation/routes/authRoutes";
import { createHabitRouter } from "./presentation/routes/habitRoutes";
import { AppError } from "./shared/AppError";

export function createApp() {
  const app = express();

  const habitRepository =
    env.DATABASE_URL === "memory" ? new InMemoryHabitRepository() : new PostgresHabitRepository(pool);
  const habitService = new HabitService(habitRepository);
  const habitController = new HabitController(habitService);
  const authService = new AuthService();
  const authController = new AuthController(authService);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",") }));
  app.use(express.json());
  app.use(express.static("public"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "habit-tracker-api" });
  });

  app.use("/api/auth", createAuthRouter(authController));
  app.use("/api/habits", createHabitRouter(habitController));
  app.use(errorHandler);

  return app;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.issues
      }
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error"
    }
  });
};
