# GSS Jiwa — Setup & Deployment Guide

**Government Secondary School, Jiwa — Official Website**  
Stack: Next.js 14 · Supabase · Tailwind CSS · TypeScript

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Pages & Routes](#2-pages--routes)
3. [Supabase Setup](#3-supabase-setup)
4. [Local Development](#4-local-development)
5. [Creating the First Admin Account](#5-creating-the-first-admin-account)
6. [Adding Students (Admin Workflow)](#6-adding-students-admin-workflow)
7. [Uploading Results](#7-uploading-results)
8. [Managing Timetables](#8-managing-timetables)
9. [Deploying to Vercel](#9-deploying-to-vercel)
10. [Database Tables Reference](#10-database-tables-reference)
11. [Environment Variables](#11-environment-variables)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Project Overview

This is the official multi-page website for Government Secondary School, Jiwa. It includes:

- **Public website** — Home, About, Academics, News, Contact
- **Student portal** — Dashboard, Results, Timetable, Notices, Profile (login with reg. number)
- **Admin dashboard** — Full management of students, results, notices, staff, timetables

All data is stored in a live Supabase (PostgreSQL) database. Authentication is handled by Supabase Auth.

---

## 2. Pages & Routes

### Public (no login required)
| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/about` | About the school |
| `/academics` | Curriculum and subjects |
| `/news` | News and announcements |
| `/contact` | Contact form |
| `/login` | Student portal login |
| `/admin/login` | Admin dashboard login |

### Student Portal (requires student login)
| Route | Description |
|-------|-------------|
| `/student/portal` | Dashboard overview |
| `/student/results` | View term results (printable) |
| `/student/timetable` | Class timetable |
| `/student/notices` | School notice board |
| `/student/profile` | Student profile details |

### Admin Dashboard (requires admin login)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Overview with stats |
| `/admin/dashboard/students` | Add, view, search, delete students |
| `/admin/dashboard/results` | Upload and manage results |
| `/admin/dashboard/notices` | Post and remove notices |
| `/admin/dashboard/staff` | Staff directory management |

---

## 3. Supabase Setup

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Name it `gss-jiwa` (or anything you like)
4. Choose a **strong database password** — save it somewhere safe
5. Select a region close to Nigeria (e.g. EU West — London is closest)
6. Click **Create new project** and wait for it to provision (~2 minutes)

### Step 2 — Run the database schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase-schema.sql` from this project
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see: `Success. No rows returned`

This creates all tables, security policies, triggers, and seeds the staff directory and a sample SS2A timetable.

### Step 3 — Configure Authentication

1. In Supabase dashboard → **Authentication** → **Settings**
2. Under **Email Auth**:
   - Enable **Email Confirmations**: **OFF** (important — students need immediate access)
   - Enable **Email Sign Up**: **ON**
3. Under **Site URL**: enter your production URL (e.g. `https://gssjiwa.vercel.app`)
4. Under **Redirect URLs**: add `http://localhost:3000/**` for local dev

### Step 4 — Get your API keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ…`)

---

## 4. Local Development

### Prerequisites
- Node.js 18 or newer
- npm or yarn

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.local.example .env.local

# 3. Edit .env.local and paste your Supabase credentials
#    NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000
```

---

## 5. Creating the First Admin Account

The admin account must be created manually in Supabase (for security — you don't want a public signup page for admins).

### In Supabase Dashboard:

**Step 1 — Create the auth user:**
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@gssjiwa.edu.ng` (or any email you want)
   - Password: choose a strong password
4. Click **Create user**
5. Copy the **User UID** shown (you'll need it next)

**Step 2 — Set their role to admin:**
1. Go to **SQL Editor**
2. Run this query (replace `PASTE_UID_HERE` with the actual UID):

```sql
insert into public.profiles (id, role, full_name)
values ('PASTE_UID_HERE', 'admin', 'Administrator')
on conflict (id) do update set role = 'admin', full_name = 'Administrator';
```

**Step 3 — Log in:**
- Go to `/admin/login`
- Enter the email and password you created
- You now have full admin access

### Creating additional admins:
Repeat the same process for each admin staff member. Each needs:
1. A Supabase auth user (Authentication → Users → Add user)
2. A profile row with `role = 'admin'`

---

## 6. Adding Students (Admin Workflow)

Once logged into the admin dashboard:

1. Go to **Students** → click **Add Student**
2. Fill in:
   - **Full Name** (required)
   - **Registration Number** (required) — format: `GSS/2024/001`
   - **Password** (required) — the password the student will use to log in
   - **Class**, **Gender**, **Date of Birth**, **Session**
   - **Guardian Name**, **Guardian Phone**, **Home Address**
3. Click **Add Student**

This automatically:
- Creates a Supabase Auth account for the student
- The student's login email is derived from their reg number: `gss_2024_001@gssjiwa.student` (internal only — students log in with their reg number, not this email)
- Creates their profile in the `profiles` table

### Student login format:
- **Registration Number**: `GSS/2024/001`
- **Password**: whatever the admin set when adding them

Students can then log in at `/login` using their reg number.

### Bulk import (advanced):
For large student populations, you can run a SQL script. Contact your developer to set this up using Supabase's service role key for bulk user creation.

---

## 7. Uploading Results

1. Go to **Admin Dashboard** → **Results** → **Upload Result**
2. Select the student from the dropdown
3. Choose the term and session
4. Enter position and total students in class (optional)
5. Enter each subject's **CA score** (out of 30) and **Exam score** (out of 70) — the total is calculated automatically
6. Add/remove subjects as needed using **+ Add subject**
7. Enter class teacher's and principal's remarks (optional)
8. Click **Save Result**

The result immediately appears on the student's portal under **My Results**.

### Printing results:
- In the results list, click the **Print** icon next to any result
- A formatted, print-ready result slip opens in a new tab
- Use your browser's print function (Ctrl+P / Cmd+P)

---

## 8. Managing Timetables

Timetables are stored per class. The sample schema includes an SS2A timetable as a reference.

### To add a timetable for another class via SQL Editor:

```sql
insert into public.timetables (class, period_order, time_slot, monday, tuesday, wednesday, thursday, friday)
values
  ('SS1A', 1, '8:00 – 8:40',   'Mathematics', 'English Language', 'Assembly/Sports', 'Physics', 'Biology'),
  ('SS1A', 2, '8:40 – 9:20',   'English Language', 'Mathematics', 'Mathematics', 'Chemistry', 'Economics'),
  -- add more periods...
  ;
```

The `period_order` column controls the display order (1 = first period, 10 = last).

> **Note:** A timetable management UI is planned for a future update. For now, manage timetables through the SQL Editor.

---

## 9. Deploying to Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — GSS Jiwa website"
git remote add origin https://github.com/YOUR_USERNAME/gss-jiwa.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Under **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```
5. Click **Deploy**

Your site will be live at `https://your-project.vercel.app` in about 2 minutes.

### Step 3 — Update Supabase Site URL
1. In Supabase → **Authentication** → **Settings** → **Site URL**
2. Change to your Vercel URL: `https://your-project.vercel.app`

### Custom domain (optional)
- In Vercel → your project → **Settings** → **Domains**
- Add your domain (e.g. `gssjiwa.edu.ng`)
- Follow the DNS configuration instructions

---

## 10. Database Tables Reference

### `profiles`
Stores all user information (students and admins).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Matches `auth.users.id` |
| `role` | text | `student` or `admin` |
| `full_name` | text | Student's full name |
| `reg_number` | text | e.g. `GSS/2024/001` |
| `class` | text | e.g. `SS2A` |
| `gender` | text | `Male` or `Female` |
| `date_of_birth` | date | |
| `guardian_name` | text | |
| `guardian_phone` | text | |
| `address` | text | |
| `session` | text | e.g. `2024/2025` |
| `status` | text | `Active` by default |

### `notices`
School announcements shown on public news page and student portal.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | |
| `type` | text | `Academic`, `General`, `Sports`, etc. |
| `title` | text | Headline |
| `body` | text | Full content |
| `created_at` | timestamptz | Auto-set |

### `results`
One row per student per term.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | |
| `student_id` | uuid | References `profiles.id` |
| `term` | text | e.g. `Second Term` |
| `session` | text | e.g. `2024/2025` |
| `class` | text | Class at time of result |
| `position` | text | e.g. `3rd` |
| `total_students` | integer | Class size |
| `principal_remark` | text | |
| `class_teacher_remark` | text | |

### `result_subjects`
Subject scores for each result record.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | |
| `result_id` | uuid | References `results.id` |
| `subject_name` | text | e.g. `Mathematics` |
| `ca_score` | integer | 0–30 |
| `exam_score` | integer | 0–70 |
| `total` | integer | Auto-calculated (ca + exam) |
| `remark` | text | e.g. `Excellent` |

### `timetables`
Class timetable rows.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | |
| `class` | text | e.g. `SS2A` |
| `period_order` | integer | For ordering periods |
| `time_slot` | text | e.g. `8:00 – 8:40` |
| `monday` – `friday` | text | Subject for each day |

### `staff`
Staff directory entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | |
| `full_name` | text | |
| `role` | text | e.g. `Mathematics Teacher` |
| `department` | text | e.g. `Sciences` |
| `phone` | text | |
| `email` | text | |
| `status` | text | `Active`, `On Leave`, `Retired` |

---

## 11. Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Both variables must start with `NEXT_PUBLIC_` so they are available in the browser.

**Never commit `.env.local` to Git.** It is already in `.gitignore`.

---

## 12. Troubleshooting

### "Invalid login credentials" on student portal
- Verify the student was added via the admin dashboard
- Check that the registration number format is exact (e.g. `GSS/2024/001` — capital letters, slashes)
- The admin can check Supabase → Authentication → Users to confirm the account exists

### "Access denied" on admin dashboard
- Confirm the user's `profiles.role` is set to `admin` (check via Supabase → Table Editor → profiles)
- Run: `update profiles set role = 'admin' where id = 'USER_ID';`

### Results not showing on student portal
- Verify the result was saved with the correct `student_id`
- Check Supabase → Table Editor → results and result_subjects

### Timetable not showing
- Confirm the student's `class` in their profile matches the `class` column in the `timetables` table exactly (case-sensitive)

### Build errors on Vercel
- Ensure both environment variables are set in Vercel project settings
- Check build logs for TypeScript errors

### Supabase RLS blocking data
- In Supabase → Authentication → Policies, verify all policies were created
- You can temporarily test by disabling RLS on a table (for debugging only — re-enable before production)

---

## Support

For technical support or feature additions, contact your developer.

**School:** Government Secondary School, Jiwa  
**Location:** Jiwa District, FCT Abuja, Nigeria  
**Motto:** *Education for Self Reliance*
