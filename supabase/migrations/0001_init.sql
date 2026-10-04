-- PyRace — boshlang'ich sxema, RLS siyosatlari va realtime sozlamalari
-- Supabase SQL Editor'da yoki `supabase db push` orqali ishga tushiring.

create extension if not exists pgcrypto;

-- ============================================================
-- JADVALLAR
-- ============================================================

-- O'qituvchilar (Supabase auth.users bilan bog'langan)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz default now()
);

-- Guruhlar
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  subject text,
  created_at timestamptz default now()
);

-- Topshiriq to'plami (quiz)
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  is_template boolean default false,
  created_at timestamptz default now()
);

-- Topshiriqlar
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  order_index int not null,
  type text not null check (type in ('crossword', 'choice', 'short', 'python', 'order')),
  title text not null,
  hint text,
  payload jsonb not null,
  points int default 100,
  time_limit_sec int,
  unique (quiz_id, order_index)
);

-- Sessiyalar
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^[0-9]{6}$'),
  quiz_id uuid references public.quizzes(id),
  group_id uuid references public.groups(id),
  host_id uuid not null references public.profiles(id),
  status text not null default 'lobby' check (status in ('lobby', 'running', 'paused', 'finished')),
  mode text not null default 'race' check (mode in ('race', 'sync')),
  started_at timestamptz,
  finished_at timestamptz,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

-- Ishtirokchilar
-- device_token ustunida tokenning o'zi emas, SHA-256 xeshi saqlanadi:
-- jadval anonim o'qilsa ham, boshqa talabaning o'rniga kirib bo'lmaydi.
create table public.players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  nickname text not null,
  sticker text not null,
  device_token text not null,
  score int default 0,
  current_task int default 1,
  finished_at timestamptz,
  is_active boolean default true,
  joined_at timestamptz default now(),
  unique (session_id, device_token)
);

-- Javoblar
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  task_id uuid references public.tasks(id),
  is_correct boolean not null,
  attempts int default 1,
  time_spent_ms int,
  raw_answer jsonb,
  points_awarded int default 0,
  created_at timestamptz default now()
);

create index idx_players_session on public.players(session_id, score desc);
create index idx_answers_session on public.answers(session_id);
create index idx_tasks_quiz on public.tasks(quiz_id, order_index);

-- ============================================================
-- Yangi foydalanuvchi uchun profil avtomatik yaratiladi
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.groups   enable row level security;
alter table public.quizzes  enable row level security;
alter table public.tasks    enable row level security;
alter table public.sessions enable row level security;
alter table public.players  enable row level security;
alter table public.answers  enable row level security;

-- profiles: faqat o'zi
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- groups: faqat egasi
create policy "groups_owner_all" on public.groups
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- quizzes: faqat egasi
create policy "quizzes_owner_all" on public.quizzes
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- tasks: faqat quiz egasi.
-- Talabalar tasks jadvalini HECH QACHON to'g'ridan-to'g'ri o'qimaydi —
-- topshiriq matni server (/api) orqali, to'g'ri javobsiz beriladi.
create policy "tasks_owner_all" on public.tasks
  for all
  using (exists (select 1 from public.quizzes q where q.id = tasks.quiz_id and q.owner_id = auth.uid()))
  with check (exists (select 1 from public.quizzes q where q.id = tasks.quiz_id and q.owner_id = auth.uid()));

-- sessions: faol sessiyalarni hamma o'qiy oladi, yozish faqat host
create policy "sessions_public_read_active" on public.sessions
  for select using (status in ('lobby', 'running', 'paused'));
create policy "sessions_host_all" on public.sessions
  for all using (host_id = auth.uid()) with check (host_id = auth.uid());

-- players: faol sessiya ishtirokchilarini hamma o'qiy oladi (ism, stiker, ball).
-- Yozish faqat server (service role) orqali — /api/session/[code]/join va /answer.
create policy "players_public_read_active" on public.players
  for select using (
    exists (select 1 from public.sessions s
            where s.id = players.session_id and s.status in ('lobby', 'running', 'paused'))
  );
create policy "players_host_read" on public.players
  for select using (
    exists (select 1 from public.sessions s where s.id = players.session_id and s.host_id = auth.uid())
  );
create policy "players_host_update" on public.players
  for update using (
    exists (select 1 from public.sessions s where s.id = players.session_id and s.host_id = auth.uid())
  );

-- device_token ustunini klient rollaridan yashiramiz
revoke select on public.players from anon, authenticated;
grant select (id, session_id, nickname, sticker, score, current_task, finished_at, is_active, joined_at)
  on public.players to anon, authenticated;

-- answers: faqat sessiya hosti o'qiydi. Talaba o'z javoblarini server orqali oladi.
create policy "answers_host_read" on public.answers
  for select using (
    exists (select 1 from public.sessions s where s.id = answers.session_id and s.host_id = auth.uid())
  );

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.sessions;
