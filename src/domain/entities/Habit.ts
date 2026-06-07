export type HabitFrequency = "daily" | "weekly";
export type HabitType = "regular" | "negative" | "todo";

export type HabitProps = {
  id: string;
  title: string;
  description: string | null;
  type: HabitType;
  frequency: HabitFrequency;
  targetCount: number;
  scheduleDays: number[];
  startDate: string;
  endDate: string | null;
  reminderTime: string | null;
  presetKey: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Habit {
  private constructor(private readonly props: HabitProps) {}

  static create(props: HabitProps): Habit {
    if (!props.title.trim()) {
      throw new Error("Habit title cannot be empty");
    }

    if (props.targetCount < 1) {
      throw new Error("Target count must be at least 1");
    }

    return new Habit(props);
  }

  toJSON() {
    return {
      id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      type: this.props.type,
      frequency: this.props.frequency,
      targetCount: this.props.targetCount,
      scheduleDays: this.props.scheduleDays,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      reminderTime: this.props.reminderTime,
      presetKey: this.props.presetKey,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }
}
