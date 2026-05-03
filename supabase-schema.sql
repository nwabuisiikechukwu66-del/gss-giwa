-- ============================================================
-- GSS JIWA — SUPABASE DATABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- Project: Government Secondary School, Jiwa
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- Extends auth.users. One row per user (student or admin).
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null default 'student' check (role in ('student', 'admin')),
  full_name       text,
  reg_number      text unique,           -- e.g. GSS/2024/001  (students only)
  class           text,                  -- e.g. SS2A
  gender          text check (gender in ('Male', 'Female')),
  date_of_birth   date,
  guardian_name   text,
  guardian_phone  text,
  address         text,
  session         text default '2024/2025',
  status          text default 'Active',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. NOTICES ──────────────────────────────────────────────
create table if not exists public.notices (
  id          uuid primary key default gen_random_uuid(),
  type        text not null default 'General',
  title       text not null,
  body        text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

drop trigger if exists notices_updated_at on public.notices;
create trigger notices_updated_at
  before update on public.notices
  for each row execute procedure public.handle_updated_at();


-- ── 3. RESULTS ──────────────────────────────────────────────
create table if not exists public.results (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references public.profiles(id) on delete cascade,
  term                  text not null,                -- e.g. Second Term
  session               text not null,                -- e.g. 2024/2025
  class                 text not null,
  position              text,                         -- e.g. 3rd
  total_students        integer,
  principal_remark      text,
  class_teacher_remark  text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

drop trigger if exists results_updated_at on public.results;
create trigger results_updated_at
  before update on public.results
  for each row execute procedure public.handle_updated_at();


-- ── 4. RESULT SUBJECTS ──────────────────────────────────────
create table if not exists public.result_subjects (
  id            uuid primary key default gen_random_uuid(),
  result_id     uuid not null references public.results(id) on delete cascade,
  subject_name  text not null,
  ca_score      integer not null default 0 check (ca_score between 0 and 30),
  exam_score    integer not null default 0 check (exam_score between 0 and 70),
  total         integer generated always as (ca_score + exam_score) stored,
  remark        text,
  created_at    timestamptz default now()
);


-- ── 5. TIMETABLES ───────────────────────────────────────────
create table if not exists public.timetables (
  id            uuid primary key default gen_random_uuid(),
  class         text not null,           -- e.g. SS2A
  period_order  integer not null,        -- 1, 2, 3… for ordering
  time_slot     text not null,           -- e.g. 8:00 – 8:40
  monday        text,
  tuesday       text,
  wednesday     text,
  thursday      text,
  friday        text,
  created_at    timestamptz default now()
);


-- ── 6. STAFF ────────────────────────────────────────────────
create table if not exists public.staff (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  role        text not null,             -- e.g. Mathematics Teacher
  department  text not null default 'Sciences',
  phone       text,
  email       text,
  status      text default 'Active',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

drop trigger if exists staff_updated_at on public.staff;
create trigger staff_updated_at
  before update on public.staff
  for each row execute procedure public.handle_updated_at();


-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles       enable row level security;
alter table public.notices        enable row level security;
alter table public.results        enable row level security;
alter table public.result_subjects enable row level security;
alter table public.timetables     enable row level security;
alter table public.staff          enable row level security;


-- ── PROFILES policies ───────────────────────────────────────
-- Students can read their own profile only
drop policy if exists "students_read_own_profile" on public.profiles;
create policy "students_read_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Helper function to check if user is admin (security definer bypasses RLS recursion)
create or replace function public.is_admin()
returns boolean language plpgsql security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$;

-- Admins can read all profiles
drop policy if exists "admins_read_all_profiles" on public.profiles;
create policy "admins_read_all_profiles"
  on public.profiles for select
  using (is_admin());

-- Admins can insert profiles
drop policy if exists "admins_insert_profiles" on public.profiles;
create policy "admins_insert_profiles"
  on public.profiles for insert
  with check (is_admin());

-- Admins can update profiles
drop policy if exists "admins_update_profiles" on public.profiles;
create policy "admins_update_profiles"
  on public.profiles for update
  using (is_admin());

-- Admins can delete profiles
drop policy if exists "admins_delete_profiles" on public.profiles;
create policy "admins_delete_profiles"
  on public.profiles for delete
  using (is_admin());

-- System trigger can insert its own profile on signup
drop policy if exists "self_insert_own_profile" on public.profiles;
create policy "self_insert_own_profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ── NOTICES policies ────────────────────────────────────────
-- Anyone authenticated can read notices
drop policy if exists "authenticated_read_notices" on public.notices;
create policy "authenticated_read_notices"
  on public.notices for select
  using (auth.role() = 'authenticated');

-- Admins can manage notices
drop policy if exists "admins_manage_notices" on public.notices;
create policy "admins_manage_notices"
  on public.notices for all
  using (is_admin())
  with check (is_admin());


-- ── RESULTS policies ────────────────────────────────────────
-- Students can read their own results only
drop policy if exists "students_read_own_results" on public.results;
create policy "students_read_own_results"
  on public.results for select
  using (auth.uid() = student_id);

-- Admins can read all results
drop policy if exists "admins_read_all_results" on public.results;
create policy "admins_read_all_results"
  on public.results for select
  using (is_admin());

-- Admins can manage results
drop policy if exists "admins_manage_results" on public.results;
create policy "admins_manage_results"
  on public.results for all
  using (is_admin())
  with check (is_admin());


-- ── RESULT_SUBJECTS policies ────────────────────────────────
-- Students can read subjects for their own results
drop policy if exists "students_read_own_subjects" on public.result_subjects;
create policy "students_read_own_subjects"
  on public.result_subjects for select
  using (
    exists (
      select 1 from public.results r
      where r.id = result_id and r.student_id = auth.uid()
    )
  );

-- Admins can manage all subjects
drop policy if exists "admins_manage_subjects" on public.result_subjects;
create policy "admins_manage_subjects"
  on public.result_subjects for all
  using (is_admin())
  with check (is_admin());


-- ── TIMETABLES policies ─────────────────────────────────────
-- All authenticated users can read timetables
drop policy if exists "authenticated_read_timetables" on public.timetables;
create policy "authenticated_read_timetables"
  on public.timetables for select
  using (auth.role() = 'authenticated');

-- Admins can manage timetables
drop policy if exists "admins_manage_timetables" on public.timetables;
create policy "admins_manage_timetables"
  on public.timetables for all
  using (is_admin())
  with check (is_admin());


-- ── STAFF policies ──────────────────────────────────────────
-- All authenticated users can read staff
drop policy if exists "authenticated_read_staff" on public.staff;
create policy "authenticated_read_staff"
  on public.staff for select
  using (auth.role() = 'authenticated');

-- Admins can manage staff
drop policy if exists "admins_manage_staff" on public.staff;
create policy "admins_manage_staff"
  on public.staff for all
  using (is_admin())
  with check (is_admin());


-- ══════════════════════════════════════════════════════════════
-- SEED DATA — initial staff members
-- (Run after applying schema)
-- ══════════════════════════════════════════════════════════════

insert into public.staff (full_name, role, department, status) values
  ('Mr. Adewale Ogundimu',   'Principal',                    'Administration', 'Active'),
  ('Mrs. Ngozi Achebe',      'Vice Principal (Academics)',    'Administration', 'Active'),
  ('Mr. Kabiru Lawal',       'Vice Principal (Admin)',        'Administration', 'Active'),
  ('Mrs. Amaka Okafor',      'Mathematics Teacher',          'Sciences',       'Active'),
  ('Mr. Yusuf Abdullahi',    'English Language Teacher',     'Arts & Languages','Active'),
  ('Miss Grace Eze',         'Biology Teacher',              'Sciences',       'Active'),
  ('Mr. Chukwuka Nnadi',     'Physics Teacher',              'Sciences',       'Active'),
  ('Mrs. Fatimah Bello',     'Chemistry Teacher',            'Sciences',       'Active'),
  ('Mr. Samuel Adeyemi',     'Economics Teacher',            'Social Sciences','Active'),
  ('Miss Halima Umar',       'Geography Teacher',            'Social Sciences','Active'),
  ('Mr. Emmanuel Okorie',    'History Teacher',              'Arts & Languages','Active'),
  ('Mrs. Chidinma Nwosu',    'Civic Education Teacher',      'Social Sciences','Active'),
  ('Mr. Bayo Fashola',       'Further Mathematics Teacher',  'Sciences',       'Active'),
  ('Mrs. Rukayat Suleiman',  'Agricultural Science Teacher', 'Sciences',       'Active'),
  ('Mr. Ifeanyi Obi',        'Computer Studies Teacher',     'Technical',      'Active'),
  ('Miss Aisha Garba',       'French Teacher',               'Arts & Languages','Active'),
  ('Mrs. Joy Ekezie',        'Home Economics Teacher',       'Technical',      'Active'),
  ('Mr. Gbenga Olatunji',    'Physical Education Teacher',   'Non-Teaching',   'Active'),
  ('Mrs. Blessing Ogbonna',  'Librarian',                    'Non-Teaching',   'Active'),
  ('Mr. Haruna Musa',        'Bursar',                       'Administration', 'Active')
on conflict do nothing;


-- ══════════════════════════════════════════════════════════════
-- SEED DATA — sample timetable for SS2A
-- ══════════════════════════════════════════════════════════════

insert into public.timetables (class, period_order, time_slot, monday, tuesday, wednesday, thursday, friday) values
  ('SS2A', 1,  '8:00 – 8:40',   'Mathematics',     'English Language', 'Assembly/Sports', 'Physics',          'Biology'),
  ('SS2A', 2,  '8:40 – 9:20',   'English Language','Mathematics',      'Mathematics',     'Chemistry',        'Economics'),
  ('SS2A', 3,  '9:20 – 10:00',  'Physics',         'Biology',          'English Language','Mathematics',      'Geography'),
  ('SS2A', 4,  '10:00 – 10:20', '— Break —',       '— Break —',        '— Break —',       '— Break —',        '— Break —'),
  ('SS2A', 5,  '10:20 – 11:00', 'Chemistry',       'Economics',        'Physics',         'English Language', 'Civic Education'),
  ('SS2A', 6,  '11:00 – 11:40', 'Biology',         'Chemistry',        'Biology',         'Economics',        'Mathematics'),
  ('SS2A', 7,  '11:40 – 12:20', 'Geography',       'Civic Education',  'Geography',       'Geography',        'Physics'),
  ('SS2A', 8,  '12:20 – 1:00',  '— Break —',       '— Break —',        '— Break —',       '— Break —',        '— Break —'),
  ('SS2A', 9,  '1:00 – 1:40',   'Civic Education', 'Geography',        'Economics',       'Biology',          'Chemistry'),
  ('SS2A', 10, '1:40 – 2:20',   'Free Period',     'Free Period',      'Civic Education', 'Civic Education',  'Free Period')
on conflict do nothing;
