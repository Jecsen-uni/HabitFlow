import { Habit } from "../src/domain/entities/Habit";
import { HabitLog } from "../src/domain/entities/HabitLog";
import { HabitRepository } from "../src/domain/repositories/HabitRepository";
import { HabitService } from "../src/application/services/HabitService";
import { InMemoryHabitRepository } from "../src/infrastructure/repositories/InMemoryHabitRepository";

function makeHabitRepository(): jest.Mocked<HabitRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createLog: jest.fn(),
    findLogsByHabitId: jest.fn(),
    findLogsByDate: jest.fn(),
    findAllLogs: jest.fn(),
    getStats: jest.fn()
  };
}

function todayLocal() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const habit = Habit.create({
  id: "habit-1",
  title: "Read",
  description: null,
  type: "regular",
  frequency: "daily",
  targetCount: 1,
  scheduleDays: [0, 1, 2, 3, 4, 5, 6],
  startDate: "2026-01-01",
  endDate: null,
  reminderTime: null,
  presetKey: null,
  isActive: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z")
});

describe("HabitService", () => {
  it("throws a not found error when a habit does not exist", async () => {
    const repository = makeHabitRepository();
    repository.findById.mockResolvedValue(null);
    const service = new HabitService(repository);

    await expect(service.getHabit("missing")).rejects.toMatchObject({
      statusCode: 404,
      code: "HABIT_NOT_FOUND"
    });
  });

  it("creates a completion log only after checking the habit exists", async () => {
    const repository = makeHabitRepository();
    const log = HabitLog.create({
      id: "log-1",
      habitId: "habit-1",
      completedOn: "2026-06-06",
      status: "completed",
      note: null,
      createdAt: new Date("2026-06-06T00:00:00.000Z")
    });

    repository.findById.mockResolvedValue(habit);
    repository.createLog.mockResolvedValue(log);

    const service = new HabitService(repository);
    const result = await service.completeHabit({
      habitId: "habit-1",
      completedOn: "2026-06-06"
    });

    expect(repository.findById).toHaveBeenCalledWith("habit-1");
    expect(result.toJSON()).toEqual(log.toJSON());
  });

  it("rejects future completion for regular habits", async () => {
    const repository = makeHabitRepository();
    repository.findById.mockResolvedValue(habit);

    const service = new HabitService(repository);

    await expect(
      service.completeHabit({
        habitId: "habit-1",
        completedOn: "2999-01-01"
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "FUTURE_HABIT_LOCKED"
    });
    expect(repository.createLog).not.toHaveBeenCalled();
  });

  it("allows future completion for one-time todo habits", async () => {
    const repository = makeHabitRepository();
    const todoHabit = Habit.create({
      ...habit.toJSON(),
      type: "todo",
      startDate: "2999-01-01"
    });
    const log = HabitLog.create({
      id: "log-2",
      habitId: "habit-1",
      completedOn: "2999-01-01",
      status: "completed",
      note: null,
      createdAt: new Date("2999-01-01T00:00:00.000Z")
    });

    repository.findById.mockResolvedValue(todoHabit);
    repository.createLog.mockResolvedValue(log);

    const service = new HabitService(repository);
    const result = await service.completeHabit({
      habitId: "habit-1",
      completedOn: "2999-01-01"
    });

    expect(result.toJSON()).toEqual(log.toJSON());
  });

  it("keeps prior completed history after deleting a habit from a selected date", async () => {
    const repository = new InMemoryHabitRepository();
    const service = new HabitService(repository);
    const created = await service.createHabit({
      title: "Write journal",
      description: null,
      type: "regular",
      frequency: "daily",
      targetCount: 1,
      scheduleDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: "2026-06-01"
    });

    await service.completeHabit({
      habitId: created.toJSON().id,
      completedOn: "2026-06-05"
    });
    await service.deleteHabit(created.toJSON().id, "2026-06-06");

    const logs = await service.getHabitLogs(created.toJSON().id);
    const history = await service.getHistory("2026-06");
    const completedDay = history.days.find((day) => day.date === "2026-06-05");
    const deletedDay = history.days.find((day) => day.date === "2026-06-06");

    expect(logs).toHaveLength(1);
    expect(completedDay).toMatchObject({
      scheduled: 1,
      finished: 1,
      completionRate: 100
    });
    expect(deletedDay).toMatchObject({
      scheduled: 0,
      finished: 0,
      completionRate: 100
    });
    expect(history.allHabits).toHaveLength(0);
  });

  it("does not count an unfailed negative habit as finished before the day ends", async () => {
    const repository = new InMemoryHabitRepository();
    const service = new HabitService(repository);
    const date = todayLocal();

    await service.createHabit({
      title: "No smoking",
      description: null,
      type: "negative",
      frequency: "daily",
      targetCount: 1,
      scheduleDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: date
    });

    const day = await service.getDay(date);
    const history = await service.getHistory(date.slice(0, 7));
    const summary = history.days.find((item) => item.date === date);

    expect(day[0]).toMatchObject({
      type: "negative",
      completed: false
    });
    expect(summary).toMatchObject({
      scheduled: 1,
      finished: 0,
      completionRate: 0
    });
  });

  it("returns the exact requested month boundaries for history", async () => {
    const repository = makeHabitRepository();
    repository.findAll.mockResolvedValue([]);
    repository.findAllLogs.mockResolvedValue([]);

    const service = new HabitService(repository);
    const history = await service.getHistory("2026-06");

    expect(history.days).toHaveLength(30);
    expect(history.days[0].date).toBe("2026-06-01");
    expect(history.days[29].date).toBe("2026-06-30");
  });
});
