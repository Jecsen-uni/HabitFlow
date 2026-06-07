CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(120) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'negative', 'todo')),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  target_count INTEGER NOT NULL DEFAULT 1 CHECK (target_count > 0),
  schedule_days INTEGER[] NOT NULL DEFAULT ARRAY[0,1,2,3,4,5,6],
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  reminder_time TIME,
  preset_key VARCHAR(80),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_on DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'skipped')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, completed_on)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_on ON habit_logs(completed_on);
