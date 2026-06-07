import { z } from "zod";

export const createHabitSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  type: z.enum(["regular", "negative", "todo"]).default("regular"),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
  targetCount: z.number().int().min(1).default(1),
  scheduleDays: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(new Date().toISOString().slice(0, 10)),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  presetKey: z.string().trim().optional().nullable()
});

export const updateHabitSchema = createHabitSchema.partial();

export const createHabitLogSchema = z.object({
  completedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["completed", "failed", "skipped"]).optional(),
  note: z.string().trim().optional().nullable()
});
