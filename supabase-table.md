Lesson

create table public.lessons (
  id uuid not null default extensions.uuid_generate_v4 (),
  subject_id uuid not null,
  semester text not null,
  group_name text not null,
  day integer not null,
  periods text not null,
  time text not null,
  room text not null,
  campus text not null,
  week_pattern text not null,
  created_at timestamp with time zone null default now(),
  constraint lessons_pkey primary key (id),
  constraint lessons_subject_id_day_time_room_key unique (subject_id, day, "time", room),
  constraint lessons_subject_id_fkey foreign KEY (subject_id) references subjects (id) on delete CASCADE,
  constraint lessons_day_check check (
    (
      (day >= 2)
      and (day <= 8)
    )
  )
) TABLESPACE pg_default;





Notes

create table public.notes (
  id uuid not null default extensions.uuid_generate_v4 (),
  lesson_id uuid not null,
  week_number integer not null,
  theory text null,
  exercises text null,
  formulas text null,
  vocabulary text null,
  images text[] null default array[]::text[],
  created_at timestamp with time zone null default now(),
  constraint notes_pkey primary key (id),
  constraint notes_lesson_id_week_number_key unique (lesson_id, week_number),
  constraint notes_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint notes_week_number_check check (
    (
      (week_number >= 25)
      and (week_number <= 33)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_notes_lesson_id on public.notes using btree (lesson_id) TABLESPACE pg_default;

create index IF not exists idx_notes_week_number on public.notes using btree (week_number) TABLESPACE pg_default;





Schedules

create table public.schedules (
  id uuid not null default gen_random_uuid (),
  subject_id uuid null,
  semester text not null,
  title text not null,
  group_name text null,
  day integer null,
  start_time timestamp without time zone not null,
  end_time timestamp without time zone not null,
  room text null,
  campus text null,
  week_start integer null,
  week_end integer null,
  tag_id uuid null references tags(id) on delete cascade,
  color text null,
  notes text null,
  created_at timestamp without time zone null default now(),
  constraint schedules_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_schedules_day_week on public.schedules using btree (day, week_start, week_end) TABLESPACE pg_default;





sessions

create table public.sessions (
  id uuid not null default extensions.uuid_generate_v4 (),
  subject_id uuid null,
  duration text not null,
  date text not null,
  notes text null,
  created_at timestamp with time zone null default now(),
  user_id uuid null,
  constraint sessions_pkey primary key (id),
  constraint sessions_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;





subjects

create table public.subjects (
  id uuid not null default extensions.uuid_generate_v4 (),
  code text not null,
  name text not null,
  credits integer not null,
  tuition_credits integer not null,
  color text null default '#FF5733'::text,
  created_at timestamp with time zone null default now(),
  constraint subjects_pkey primary key (id),
  constraint subjects_code_key unique (code)
) TABLESPACE pg_default;





tasks

create table public.tasks (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  subject_id uuid null,
  due_date text not null,
  created_at timestamp with time zone null default now(),
  constraint tasks_pkey primary key (id)
) TABLESPACE pg_default;


tags

create table public.tags (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  type text not null default 'manual',
  color text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone null default now(),
  constraint tags_pkey primary key (id)
) TABLESPACE pg_default;


exams

create table public.exams (
  id uuid not null default extensions.uuid_generate_v4 (),
  subject_id uuid references subjects(id) on delete cascade,
  subject_code text not null,
  subject_name text not null,
  group_class text null,
  exam_date date not null,
  exam_type text not null,
  campus text null,
  room text null,
  day_of_week integer null,
  start_time text not null,
  duration_minutes integer not null,
  semester text not null,
  tag_id uuid references tags(id) on delete cascade,
  created_at timestamp with time zone null default now(),
  constraint exams_pkey primary key (id)
) TABLESPACE pg_default;