import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query
} from "@nestjs/common";
import { HabitService } from "../../application/services/HabitService";
import {
  createHabitLogSchema,
  createHabitSchema,
  updateHabitSchema
} from "../validators/habitSchemas";

@Controller("api/habits")
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post()
  create(@Body() body: unknown) {
    const habit = this.habitService.createHabit(createHabitSchema.parse(body));
    return Promise.resolve(habit).then((result) => ({ data: result.toJSON() }));
  }

  @Get()
  async list() {
    const habits = await this.habitService.listHabits();
    return { data: habits.map((habit) => habit.toJSON()) };
  }

  @Get("day")
  async day(@Query("date") date?: string) {
    const selectedDate = date?.match(/^\d{4}-\d{2}-\d{2}$/) ? date : new Date().toISOString().slice(0, 10);
    const habits = await this.habitService.getDay(selectedDate);
    return { data: habits };
  }

  @Get("history/day")
  async historyDay(@Query("date") date?: string) {
    const selectedDate = date?.match(/^\d{4}-\d{2}-\d{2}$/) ? date : new Date().toISOString().slice(0, 10);
    const history = await this.habitService.getHistoryDay(selectedDate);
    return { data: history };
  }

  @Get("history")
  async history(@Query("month") month?: string) {
    const selectedMonth = month?.match(/^\d{4}-\d{2}$/) ? month : new Date().toISOString().slice(0, 7);
    const history = await this.habitService.getHistory(selectedMonth);
    return { data: history };
  }

  @Get("journeys")
  journeys() {
    return { data: this.habitService.getJourneys() };
  }

  @Post("journeys/:id/apply")
  async applyJourney(@Param("id") id: string) {
    const habits = await this.habitService.applyJourney(id);
    return { data: habits.map((habit) => habit.toJSON()) };
  }

  @Get("stats")
  async stats() {
    return { data: await this.habitService.getStats() };
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    const habit = await this.habitService.getHabit(id);
    return { data: habit.toJSON() };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    const habit = await this.habitService.updateHabit(id, updateHabitSchema.parse(body));
    return { data: habit.toJSON() };
  }

  @Delete(":id")
  @HttpCode(204)
  async delete(@Param("id") id: string, @Query("effectiveDate") effectiveDate?: string) {
    const selectedDate = effectiveDate?.match(/^\d{4}-\d{2}-\d{2}$/) ? effectiveDate : undefined;
    await this.habitService.deleteHabit(id, selectedDate);
  }

  @Post(":id/logs")
  async complete(@Param("id") id: string, @Body() body: unknown) {
    const payload = createHabitLogSchema.parse(body);
    const log = await this.habitService.completeHabit({
      habitId: id,
      completedOn: payload.completedOn,
      status: payload.status,
      note: payload.note
    });

    return { data: log.toJSON() };
  }

  @Get(":id/logs")
  async logs(@Param("id") id: string) {
    const logs = await this.habitService.getHabitLogs(id);
    return { data: logs.map((log) => log.toJSON()) };
  }
}
