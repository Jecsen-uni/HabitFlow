import { Pool } from "pg";
import { Habit } from "../../domain/entities/Habit";
import { HabitLog } from "../../domain/entities/HabitLog";
import {
  CreateHabitData,
  CreateHabitLogData,
  HabitRepository,
  HabitStats,
  UpdateHabitData
} from "../../domain/repositories/HabitRepository";

type HabitRow = {
  id: string;
  title: string;
  description: string | null;
  type: "regular" | "negative" | "todo";
  frequency: "daily" | "weekly";
  target_count: number;
  schedule_days: number[];
  start_date: string;
  end_date: string | null;
  reminder_time: string | null;
  preset_key: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

type HabitLogRow = {
  id: string;
  habit_id: string;
  completed_on: string;
  status: "completed" | "failed" | "skipped";
  note: string | null;
  created_at: Date;
};

export class PostgresHabitRepository implements HabitRepository {
  constructor(private readonly db: Pool) {}

  async create(data: CreateHabitData): Promise<Habit> {
    const result = await this.db.query<HabitRow>(
      `INSERT INTO habits
        (title, description, type, frequency, target_count, schedule_days, start_date, end_date, reminder_time, preset_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.type,
        data.frequency,
        data.targetCount,
        data.scheduleDays,
        data.startDate,
        data.endDate ?? null,
        data.reminderTime ?? null,
        data.presetKey ?? null
      ]
    );

    return this.toHabit(result.rows[0]);
  }

  async findAll(): Promise<Habit[]> {
    const result = await this.db.query<HabitRow>("SELECT * FROM habits ORDER BY created_at DESC");
    return result.rows.map((row) => this.toHabit(row));
  }

  async findById(id: string): Promise<Habit | null> {
    const result = await this.db.query<HabitRow>("SELECT * FROM habits WHERE id = $1", [id]);
    return result.rows[0] ? this.toHabit(result.rows[0]) : null;
  }

  async update(id: string, data: UpdateHabitData): Promise<Habit | null> {
    const result = await this.db.query<HabitRow>(
      `UPDATE habits
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           type = COALESCE($4, type),
           frequency = COALESCE($5, frequency),
           target_count = COALESCE($6, target_count),
           schedule_days = COALESCE($7, schedule_days),
           start_date = COALESCE($8, start_date),
           end_date = COALESCE($9, end_date),
           reminder_time = COALESCE($10, reminder_time),
           preset_key = COALESCE($11, preset_key),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.title,
        data.description,
        data.type,
        data.frequency,
        data.targetCount,
        data.scheduleDays,
        data.startDate,
        data.endDate,
        data.reminderTime,
        data.presetKey
      ]
    );

    return result.rows[0] ? this.toHabit(result.rows[0]) : null;
  }

  async delete(id: string, endDate?: string): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE habits
       SET is_active = FALSE,
           end_date = COALESCE($2, end_date, CURRENT_DATE),
           updated_at = NOW()
       WHERE id = $1`,
      [id, endDate ?? null]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async createLog(data: CreateHabitLogData): Promise<HabitLog> {
    const result = await this.db.query<HabitLogRow>(
      `INSERT INTO habit_logs (habit_id, completed_on, status, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (habit_id, completed_on)
       DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note
       RETURNING *`,
      [data.habitId, data.completedOn, data.status ?? "completed", data.note ?? null]
    );

    return this.toHabitLog(result.rows[0]);
  }

  async findLogsByHabitId(habitId: string): Promise<HabitLog[]> {
    const result = await this.db.query<HabitLogRow>(
      "SELECT * FROM habit_logs WHERE habit_id = $1 ORDER BY completed_on DESC",
      [habitId]
    );

    return result.rows.map((row) => this.toHabitLog(row));
  }

  async findLogsByDate(date: string): Promise<HabitLog[]> {
    const result = await this.db.query<HabitLogRow>(
      "SELECT * FROM habit_logs WHERE completed_on = $1 ORDER BY created_at DESC",
      [date]
    );

    return result.rows.map((row) => this.toHabitLog(row));
  }

  async findAllLogs(): Promise<HabitLog[]> {
    const result = await this.db.query<HabitLogRow>("SELECT * FROM habit_logs ORDER BY completed_on DESC");
    return result.rows.map((row) => this.toHabitLog(row));
  }

  async getStats(): Promise<HabitStats[]> {
    const result = await this.db.query<{
      habit_id: string;
      title: string;
      completions: string;
      target_count: number;
      progress_percent: string;
    }>(
      `SELECT h.id AS habit_id,
              h.title,
              COUNT(l.id) AS completions,
              h.target_count,
              LEAST(100, ROUND((COUNT(l.id)::numeric / h.target_count) * 100)) AS progress_percent
       FROM habits h
       LEFT JOIN habit_logs l ON l.habit_id = h.id AND l.status = 'completed'
       GROUP BY h.id, h.title, h.target_count
       ORDER BY h.created_at DESC`
    );

    return result.rows.map((row) => ({
      habitId: row.habit_id,
      title: row.title,
      completions: Number(row.completions),
      targetCount: row.target_count,
      progressPercent: Number(row.progress_percent)
    }));
  }

  private toHabit(row: HabitRow): Habit {
    return Habit.create({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      frequency: row.frequency,
      targetCount: row.target_count,
      scheduleDays: row.schedule_days,
      startDate: row.start_date,
      endDate: row.end_date,
      reminderTime: row.reminder_time,
      presetKey: row.preset_key,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  private toHabitLog(row: HabitLogRow): HabitLog {
    return HabitLog.create({
      id: row.id,
      habitId: row.habit_id,
      completedOn: row.completed_on,
      status: row.status,
      note: row.note,
      createdAt: row.created_at
    });
  }
}
