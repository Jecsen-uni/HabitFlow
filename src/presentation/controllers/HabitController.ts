import { Request, Response } from "express";
import { HabitService } from "../../application/services/HabitService";
import {
  createHabitLogSchema,
  createHabitSchema,
  updateHabitSchema
} from "../validators/habitSchemas";

export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  create = async (req: Request, res: Response) => {
    const habit = await this.habitService.createHabit(createHabitSchema.parse(req.body));
    res.status(201).json({ data: habit.toJSON() });
  };

  list = async (_req: Request, res: Response) => {
    const habits = await this.habitService.listHabits();
    res.json({ data: habits.map((habit) => habit.toJSON()) });
  };

  day = async (req: Request, res: Response) => {
    const date =
      typeof req.query.date === "string" && req.query.date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? req.query.date
        : new Date().toISOString().slice(0, 10);
    const habits = await this.habitService.getDay(date);
    res.json({ data: habits });
  };

  history = async (req: Request, res: Response) => {
    const month =
      typeof req.query.month === "string" && req.query.month.match(/^\d{4}-\d{2}$/)
        ? req.query.month
        : new Date().toISOString().slice(0, 7);
    const history = await this.habitService.getHistory(month);
    res.json({ data: history });
  };

  historyDay = async (req: Request, res: Response) => {
    const date =
      typeof req.query.date === "string" && req.query.date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? req.query.date
        : new Date().toISOString().slice(0, 10);
    const history = await this.habitService.getHistoryDay(date);
    res.json({ data: history });
  };

  journeys = async (_req: Request, res: Response) => {
    res.json({ data: this.habitService.getJourneys() });
  };

  applyJourney = async (req: Request, res: Response) => {
    const habits = await this.habitService.applyJourney(this.param(req.params.id));
    res.status(201).json({ data: habits.map((habit) => habit.toJSON()) });
  };

  get = async (req: Request, res: Response) => {
    const habit = await this.habitService.getHabit(this.param(req.params.id));
    res.json({ data: habit.toJSON() });
  };

  update = async (req: Request, res: Response) => {
    const habit = await this.habitService.updateHabit(this.param(req.params.id), updateHabitSchema.parse(req.body));
    res.json({ data: habit.toJSON() });
  };

  delete = async (req: Request, res: Response) => {
    const effectiveDate =
      typeof req.query.effectiveDate === "string" && req.query.effectiveDate.match(/^\d{4}-\d{2}-\d{2}$/)
        ? req.query.effectiveDate
        : undefined;
    await this.habitService.deleteHabit(this.param(req.params.id), effectiveDate);
    res.status(204).send();
  };

  complete = async (req: Request, res: Response) => {
    const payload = createHabitLogSchema.parse(req.body);
    const log = await this.habitService.completeHabit({
      habitId: this.param(req.params.id),
      completedOn: payload.completedOn,
      status: payload.status,
      note: payload.note
    });

    res.status(201).json({ data: log.toJSON() });
  };

  logs = async (req: Request, res: Response) => {
    const logs = await this.habitService.getHabitLogs(this.param(req.params.id));
    res.json({ data: logs.map((log) => log.toJSON()) });
  };

  stats = async (_req: Request, res: Response) => {
    const stats = await this.habitService.getStats();
    res.json({ data: stats });
  };

  private param(value: string | string[]): string {
    return Array.isArray(value) ? value[0] : value;
  }
}
