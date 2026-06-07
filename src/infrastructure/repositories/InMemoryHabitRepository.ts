import { randomUUID } from "node:crypto";
import { Habit } from "../../domain/entities/Habit";
import { HabitLog } from "../../domain/entities/HabitLog";
import {
  CreateHabitData,
  CreateHabitLogData,
  HabitRepository,
  HabitStats,
  UpdateHabitData
} from "../../domain/repositories/HabitRepository";

type HabitRecord = ReturnType<Habit["toJSON"]>;
type HabitLogRecord = ReturnType<HabitLog["toJSON"]>;

export class InMemoryHabitRepository implements HabitRepository {
  private readonly habits = new Map<string, HabitRecord>();
  private readonly logs = new Map<string, HabitLogRecord>();

  async create(data: CreateHabitData): Promise<Habit> {
    const now = new Date();
    const habit = Habit.create({
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      frequency: data.frequency,
      targetCount: data.targetCount,
      scheduleDays: data.scheduleDays,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      reminderTime: data.reminderTime ?? null,
      presetKey: data.presetKey ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });

    this.habits.set(habit.toJSON().id, habit.toJSON());
    return habit;
  }

  async findAll(): Promise<Habit[]> {
    return [...this.habits.values()]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .map((habit) => Habit.create(habit));
  }

  async findById(id: string): Promise<Habit | null> {
    const habit = this.habits.get(id);
    return habit ? Habit.create(habit) : null;
  }

  async update(id: string, data: UpdateHabitData): Promise<Habit | null> {
    const existing = this.habits.get(id);
    if (!existing) {
      return null;
    }

    const updated = Habit.create({
      ...existing,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      type: data.type ?? existing.type,
      frequency: data.frequency ?? existing.frequency,
      targetCount: data.targetCount ?? existing.targetCount,
      scheduleDays: data.scheduleDays ?? existing.scheduleDays,
      startDate: data.startDate ?? existing.startDate,
      endDate: Object.prototype.hasOwnProperty.call(data, "endDate") ? data.endDate ?? null : existing.endDate,
      reminderTime: Object.prototype.hasOwnProperty.call(data, "reminderTime")
        ? data.reminderTime ?? null
        : existing.reminderTime,
      presetKey: Object.prototype.hasOwnProperty.call(data, "presetKey") ? data.presetKey ?? null : existing.presetKey,
      isActive: existing.isActive,
      updatedAt: new Date()
    });

    this.habits.set(id, updated.toJSON());
    return updated;
  }

  async delete(id: string, endDate?: string): Promise<boolean> {
    const existing = this.habits.get(id);
    if (!existing) {
      return false;
    }

    this.habits.set(id, {
      ...existing,
      isActive: false,
      endDate: endDate ?? existing.endDate ?? this.formatDate(new Date()),
      updatedAt: new Date()
    });

    return true;
  }

  async createLog(data: CreateHabitLogData): Promise<HabitLog> {
    const duplicate = [...this.logs.values()].find(
      (log) => log.habitId === data.habitId && log.completedOn === data.completedOn
    );

    const log = HabitLog.create({
      id: duplicate?.id ?? randomUUID(),
      habitId: data.habitId,
      completedOn: data.completedOn,
      status: data.status ?? "completed",
      note: data.note ?? null,
      createdAt: duplicate?.createdAt ?? new Date()
    });

    this.logs.set(log.toJSON().id, log.toJSON());
    return log;
  }

  async findLogsByHabitId(habitId: string): Promise<HabitLog[]> {
    return [...this.logs.values()]
      .filter((log) => log.habitId === habitId)
      .sort((left, right) => right.completedOn.localeCompare(left.completedOn))
      .map((log) => HabitLog.create(log));
  }

  async findLogsByDate(date: string): Promise<HabitLog[]> {
    return [...this.logs.values()]
      .filter((log) => log.completedOn === date)
      .map((log) => HabitLog.create(log));
  }

  async findAllLogs(): Promise<HabitLog[]> {
    return [...this.logs.values()].map((log) => HabitLog.create(log));
  }

  async getStats(): Promise<HabitStats[]> {
    return [...this.habits.values()].map((habit) => {
      const completions = [...this.logs.values()].filter(
        (log) => log.habitId === habit.id && log.status === "completed"
      ).length;

      return {
        habitId: habit.id,
        title: habit.title,
        completions,
        targetCount: habit.targetCount,
        progressPercent: Math.min(100, Math.round((completions / habit.targetCount) * 100))
      };
    });
  }

  private formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
