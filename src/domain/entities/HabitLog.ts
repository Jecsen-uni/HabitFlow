export type HabitLogProps = {
  id: string;
  habitId: string;
  completedOn: string;
  status: "completed" | "failed" | "skipped";
  note: string | null;
  createdAt: Date;
};

export class HabitLog {
  private constructor(private readonly props: HabitLogProps) {}

  static create(props: HabitLogProps): HabitLog {
    if (!props.completedOn.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error("Completion date must use YYYY-MM-DD format");
    }

    return new HabitLog(props);
  }

  toJSON() {
    return {
      id: this.props.id,
      habitId: this.props.habitId,
      completedOn: this.props.completedOn,
      status: this.props.status,
      note: this.props.note,
      createdAt: this.props.createdAt
    };
  }
}
