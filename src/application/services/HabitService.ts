import {
  CreateHabitData,
  CreateHabitLogData,
  HabitRepository,
  UpdateHabitData
} from "../../domain/repositories/HabitRepository";
import { Habit } from "../../domain/entities/Habit";
import { HabitLog } from "../../domain/entities/HabitLog";
import { AppError } from "../../shared/AppError";

const journeyTemplates = [
  {
    id: "walk-everyday",
    title: "Walk Every Day",
    benefit: "Improves energy, heart health, and mood.",
    description: "A simple daily walking routine with a flexible reminder.",
    habits: [{ title: "Walk for 20 minutes", type: "regular" as const, scheduleDays: [0, 1, 2, 3, 4, 5, 6] }]
  },
  {
    id: "sleep-on-time",
    title: "Sleep On Time",
    benefit: "Supports recovery, focus, and emotional regulation.",
    description: "Build a consistent sleep routine with a nighttime reminder.",
    habits: [{ title: "Sleep before 10:30 PM", type: "regular" as const, scheduleDays: [0, 1, 2, 3, 4, 5, 6] }]
  },
  {
    id: "meditation",
    title: "Meditation",
    benefit: "Reduces stress and trains attention.",
    description: "Start with a short daily mindfulness habit.",
    habits: [{ title: "Meditate for 5 minutes", type: "regular" as const, scheduleDays: [0, 1, 2, 3, 4, 5, 6] }]
  },
  {
    id: "morning-routine",
    title: "Morning Routine",
    benefit: "Creates momentum early in the day.",
    description: "A compact morning plan for hydration, planning, and movement.",
    habits: [
      { title: "Drink water after waking", type: "regular" as const, scheduleDays: [0, 1, 2, 3, 4, 5, 6] },
      { title: "Plan top 3 tasks", type: "regular" as const, scheduleDays: [1, 2, 3, 4, 5] }
    ]
  },
  {
    id: "pray-routine",
    title: "Pray Routine",
    benefit: "Supports spiritual consistency and reflection.",
    description: "Daily prayer reminders with a simple completion check.",
    habits: [{ title: "Complete daily prayer routine", type: "regular" as const, scheduleDays: [0, 1, 2, 3, 4, 5, 6] }]
  }
];

export class HabitService {
  constructor(private readonly habitRepository: HabitRepository) {}

  async createHabit(data: CreateHabitData) {
    return this.habitRepository.create(this.withDefaults(data));
  }

  async listHabits() {
    return this.habitRepository.findAll();
  }

  async getHabit(id: string) {
    const habit = await this.habitRepository.findById(id);

    if (!habit) {
      throw new AppError("Habit not found", 404, "HABIT_NOT_FOUND");
    }

    return habit;
  }

  async updateHabit(id: string, data: UpdateHabitData) {
    const habit = await this.habitRepository.update(id, data);

    if (!habit) {
      throw new AppError("Habit not found", 404, "HABIT_NOT_FOUND");
    }

    return habit;
  }

  async deleteHabit(id: string, effectiveDate = this.today()) {
    const endDate = this.previousDate(effectiveDate);
    const deleted = await this.habitRepository.delete(id, endDate);

    if (!deleted) {
      throw new AppError("Habit not found", 404, "HABIT_NOT_FOUND");
    }
  }

  async completeHabit(data: CreateHabitLogData) {
    const habit = await this.getHabit(data.habitId);
    const habitData = habit.toJSON();
    if (habitData.type !== "todo" && data.status !== "skipped" && data.completedOn > this.today()) {
      throw new AppError(
        "Future regular and negative habits cannot be completed before their scheduled date.",
        400,
        "FUTURE_HABIT_LOCKED"
      );
    }

    return this.habitRepository.createLog({
      ...data,
      status: data.status ?? (habitData.type === "negative" ? "failed" : "completed")
    });
  }

  async getHabitLogs(habitId: string) {
    await this.getHabit(habitId);
    return this.habitRepository.findLogsByHabitId(habitId);
  }

  async getStats() {
    return this.habitRepository.getStats();
  }

  async getDay(date: string) {
    const habits = await this.habitRepository.findAll();
    const logs = await this.habitRepository.findLogsByDate(date);
    const logsByHabit = new Map(logs.map((log) => [log.toJSON().habitId, log.toJSON()]));

    return habits
      .map((habit) => habit.toJSON())
      .filter((habit) => this.isScheduledOn(habit, date))
      .filter((habit) => logsByHabit.get(habit.id)?.status !== "skipped")
      .map((habit) => {
        const log = logsByHabit.get(habit.id);
        const completed = this.isHabitComplete(habit, log ?? null, date);

        return {
          ...habit,
          scheduledOn: date,
          completed,
          log: log ?? null
        };
      });
  }

  async getHistory(month: string) {
    const habits = (await this.habitRepository.findAll()).map((habit) => habit.toJSON());
    const logs = (await this.habitRepository.findAllLogs()).map((log) => log.toJSON());
    const daySummaries = this.buildDaySummaries(this.daysInMonth(month), habits, logs);
    const lifetimeSummaries = this.buildDaySummaries(this.lifetimeDays(habits, logs), habits, logs);
    const activeDays = daySummaries.filter((day) => day.scheduled > 0);
    const finishedHabits = daySummaries.reduce((sum, day) => sum + day.finished, 0);
    const perfectDays = daySummaries.filter((day) => day.scheduled > 0 && day.finished === day.scheduled).length;
    const lifetimeFinishedHabits = lifetimeSummaries.reduce((sum, day) => sum + day.finished, 0);
    const lifetimePerfectDays = lifetimeSummaries.filter((day) => day.scheduled > 0 && day.finished === day.scheduled).length;

    return {
      month,
      currentStreak: this.currentStreak(lifetimeSummaries),
      finishedHabits,
      completionRate:
        activeDays.length === 0
          ? 100
          : Math.round(activeDays.reduce((sum, day) => sum + day.completionRate, 0) / activeDays.length),
      achievements: {
        finishedHabits: lifetimeFinishedHabits,
        perfectDays: lifetimePerfectDays,
        dayStreaks: this.bestStreak(lifetimeSummaries)
      },
      days: daySummaries,
      allHabits: habits.filter((habit) => habit.isActive)
    };
  }

  async getHistoryDay(date: string) {
    const habits = (await this.habitRepository.findAll()).map((habit) => habit.toJSON());
    const logs = (await this.habitRepository.findLogsByDate(date)).map((log) => log.toJSON());
    const scheduled = habits
      .filter((habit) => this.isScheduledOn(habit, date, true))
      .filter((habit) => logs.find((entry) => entry.habitId === habit.id)?.status !== "skipped");

    const items = scheduled.map((habit) => {
      const log = logs.find((entry) => entry.habitId === habit.id);
      const completed = this.isHabitComplete(habit, log ?? null, date);

      return {
        ...habit,
        scheduledOn: date,
        completed,
        log: log ?? null
      };
    });

    return {
      date,
      scheduled: items.length,
      finished: items.filter((item) => item.completed).length,
      habits: items
    };
  }

  getJourneys() {
    return journeyTemplates;
  }

  async applyJourney(id: string) {
    const journey = journeyTemplates.find((item) => item.id === id);
    if (!journey) {
      throw new AppError("Journey not found", 404, "JOURNEY_NOT_FOUND");
    }

    const created = [];
    for (const habit of journey.habits) {
      created.push(
        await this.createHabit({
          title: habit.title,
          description: journey.description,
          type: habit.type,
          frequency: "daily",
          targetCount: 1,
          scheduleDays: habit.scheduleDays,
          startDate: this.today(),
          presetKey: id
        })
      );
    }

    return created;
  }

  private withDefaults(data: CreateHabitData): CreateHabitData {
    return {
      ...data,
      type: data.type ?? "regular",
      frequency: data.frequency ?? "daily",
      targetCount: data.targetCount ?? 1,
      scheduleDays: data.scheduleDays?.length ? data.scheduleDays : [0, 1, 2, 3, 4, 5, 6],
      startDate: data.startDate ?? this.today(),
      endDate: data.endDate ?? null,
      reminderTime: data.reminderTime ?? null,
      presetKey: data.presetKey ?? null
    };
  }

  private isScheduledOn(
    habit: { type: string; scheduleDays: number[]; startDate: string; endDate: string | null; isActive: boolean },
    date: string,
    includeInactiveHistory = false
  ) {
    if (date < habit.startDate || (habit.endDate && date > habit.endDate)) {
      return false;
    }

    if (!habit.isActive && !includeInactiveHistory) {
      return false;
    }

    if (habit.type === "todo") {
      return habit.startDate === date;
    }

    const day = new Date(`${date}T00:00:00`).getDay();
    return habit.scheduleDays.includes(day);
  }

  private buildDaySummaries(
    days: string[],
    habits: ReturnType<Habit["toJSON"]>[],
    logs: ReturnType<HabitLog["toJSON"]>[]
  ) {
    return days.map((date) => {
      const logsForDate = logs.filter((log) => log.completedOn === date);
      const scheduled = habits
        .filter((habit) => this.isScheduledOn(habit, date, true))
        .filter((habit) => logsForDate.find((entry) => entry.habitId === habit.id)?.status !== "skipped");
      const finished = scheduled.filter((habit) => {
        const log = logsForDate.find((entry) => entry.habitId === habit.id);
        if (log?.status === "skipped") {
          return false;
        }
        return this.isHabitComplete(habit, log ?? null, date);
      }).length;

      return {
        date,
        scheduled: scheduled.length,
        finished,
        completionRate: scheduled.length === 0 ? 100 : Math.round((finished / scheduled.length) * 100)
      };
    });
  }

  private lifetimeDays(habits: ReturnType<Habit["toJSON"]>[], logs: ReturnType<HabitLog["toJSON"]>[]) {
    const candidates = [
      ...habits.map((habit) => habit.startDate),
      ...logs.map((log) => log.completedOn),
      this.today()
    ].sort();
    const start = candidates[0] ?? this.today();
    const end = this.today();
    const cursor = new Date(`${start}T00:00:00`);
    const days: string[] = [];

    while (this.formatDate(cursor) <= end) {
      days.push(this.formatDate(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }

  private daysInMonth(month: string) {
    const [year, monthIndex] = month.split("-").map(Number);
    const date = new Date(year, monthIndex - 1, 1);
    const days: string[] = [];

    while (date.getMonth() === monthIndex - 1) {
      days.push(this.formatDate(date));
      date.setDate(date.getDate() + 1);
    }

    return days;
  }

  private currentStreak(days: { date: string; scheduled: number; finished: number }[]) {
    let streak = 0;
    const today = this.today();

    for (const day of [...days].filter((item) => item.date < today).reverse()) {
      if (day.scheduled === 0) {
        continue;
      }
      if (day.finished === day.scheduled) {
        streak += 1;
        continue;
      }
      break;
    }

    return streak;
  }

  private bestStreak(days: { scheduled: number; finished: number }[]) {
    let best = 0;
    let current = 0;

    for (const day of days) {
      if (day.scheduled > 0 && day.finished === day.scheduled) {
        current += 1;
        best = Math.max(best, current);
      } else if (day.scheduled > 0) {
        current = 0;
      }
    }

    return best;
  }

  private today() {
    return this.formatDate(new Date());
  }

  private isHabitComplete(
    habit: ReturnType<Habit["toJSON"]>,
    log: ReturnType<HabitLog["toJSON"]> | null,
    date: string
  ) {
    if (log?.status === "skipped") {
      return false;
    }

    if (habit.type === "negative") {
      if (log?.status === "failed") {
        return false;
      }
      if (log?.status === "completed") {
        return true;
      }
      return date < this.today();
    }

    return log?.status === "completed";
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private previousDate(date: string) {
    const cursor = new Date(`${date}T00:00:00`);
    cursor.setDate(cursor.getDate() - 1);
    return this.formatDate(cursor);
  }
}
