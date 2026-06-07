import { Router } from "express";
import { HabitController } from "../controllers/HabitController";
import { asyncHandler } from "../../shared/asyncHandler";

export function createHabitRouter(controller: HabitController): Router {
  const router = Router();

  router.get("/day", asyncHandler(controller.day));
  router.get("/history/day", asyncHandler(controller.historyDay));
  router.get("/history", asyncHandler(controller.history));
  router.get("/journeys", asyncHandler(controller.journeys));
  router.post("/journeys/:id/apply", asyncHandler(controller.applyJourney));
  router.get("/stats", asyncHandler(controller.stats));
  router.get("/", asyncHandler(controller.list));
  router.post("/", asyncHandler(controller.create));
  router.get("/:id", asyncHandler(controller.get));
  router.patch("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.delete));
  router.post("/:id/logs", asyncHandler(controller.complete));
  router.get("/:id/logs", asyncHandler(controller.logs));

  return router;
}
