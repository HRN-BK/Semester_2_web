-- Initialize calendar-related tables

-- Ensure subjects have a color column
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  semester TEXT NOT NULL,
  title TEXT NOT NULL,
  group_name TEXT,
  day INTEGER,
  start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  room TEXT,
  campus TEXT,
  week_start INTEGER,
  week_end INTEGER,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_day_week
  ON schedules (day, week_start, week_end);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  semester TEXT NOT NULL,
  group_name TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 2 AND day <= 8),
  periods TEXT NOT NULL,
  time TEXT NOT NULL,
  room TEXT NOT NULL,
  campus TEXT NOT NULL,
  week_pattern TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE lessons
  ADD CONSTRAINT IF NOT EXISTS lessons_subject_id_day_time_room_key
    UNIQUE (subject_id, day, "time", room);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 25 AND week_number <= 33),
  theory TEXT,
  exercises TEXT,
  formulas TEXT,
  vocabulary TEXT,
  images TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_lesson_id ON notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_notes_week_number ON notes(week_number);
