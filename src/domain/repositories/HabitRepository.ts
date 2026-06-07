import { Habit, HabitFrequency, HabitType } from "../entities/Habit";
import { HabitLog } from "../entities/HabitLog";

export type CreateHabitData = {
  title: string;
  description?: string | null;
  type: HabitType;
  frequency: HabitFrequency;
  targetCount: number;
  scheduleDays: number[];
  startDate: string;
  endDate?: string | null;
  reminderTime?: string | null;
  presetKey?: string | null;
};

export type UpdateHabitData = Partial<CreateHabitData>;

export type CreateHabitLogData = {
  habitId: string;
  completedOn: string;
  status?: "completed" | "failed" | "skipped";
  note?: string | null;
};

export type HabitStats = {
  habitId: string;
  title: string;
  completions: number;
  targetCount: number;
  progressPercent: number;
};

export interface HabitRepository {
  create(data: CreateHabitData): Promise<Habit>;
  findAll(): Promise<Habit[]>;
  findById(id: string): Promise<Habit | null>;
  update(id: string, data: UpdateHabitData): Promise<Habit | null>;
  delete(id: string, endDate?: string): Promise<boolean>;
  createLog(data: CreateHabitLogData): Promise<HabitLog>;
  findLogsByHabitId(habitId: string): Promise<HabitLog[]>;
  findLogsByDate(date: string): Promise<HabitLog[]>;
  findAllLogs(): Promise<HabitLog[]>;
  getStats(): Promise<HabitStats[]>;
}
