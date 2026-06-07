import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { asyncHandler } from "../../shared/asyncHandler";

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post("/register", asyncHandler(controller.register));
  router.post("/login", asyncHandler(controller.login));
  router.get("/me", asyncHandler(controller.me));

  return router;
}
