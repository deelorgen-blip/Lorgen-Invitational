-- Lorgen Invitational — Database Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- TOURNAMENTS
-- ============================================================
create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Lorgen Invitational',
  date timestamptz,
  course text,
  format text default '2-Mann Scramble',
  holes int default 18,
  status text default 'upcoming' check (status in ('upcoming','active','completed')),
  handicap_pct int default 25,
  hole_pars jsonb default '[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]'::jsonb,
  coin_back_image_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  name text not null,
  pin text not null,
  player1 text,
  player2 text,
  handicap numeric default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- SCORES (per-hole)
-- ============================================================
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  hole int not null check (hole >= 1 and hole <= 18),
  strokes int check (strokes >= 1),
  points int,
  submitted_at timestamptz default now(),
  unique(team_id, hole)
);

-- ============================================================
-- SPECIAL AWARDS
-- ============================================================
create table if not exists special_awards (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  type text not null check (type in ('longest_drive','closest_to_pin')),
  hole int,
  team_id uuid references teams(id) on delete set null,
  value text,
  photo_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- PHOTOS
-- ============================================================
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  storage_path text not null,
  hole int,
  caption text,
  votes int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- SPONSORS
-- ============================================================
create table if not exists sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  visible boolean default true,
  sort_order int default 0
);

-- ============================================================
-- HALL OF FAME
-- ============================================================
create table if not exists hall_of_fame (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  team_name text not null,
  player1 text,
  player2 text,
  format text,
  score text,
  notes text
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  team_name text,
  message text not null,
  type text default 'message' check (type in ('message','birdie_shoutout')),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table tournaments enable row level security;
alter table teams enable row level security;
alter table scores enable row level security;
alter table special_awards enable row level security;
alter table photos enable row level security;
alter table sponsors enable row level security;
alter table hall_of_fame enable row level security;
alter table chat_messages enable row level security;

-- Public read access for most tables
create policy "Public read tournaments" on tournaments for select using (true);
create policy "Public read teams" on teams for select using (true);
create policy "Public read scores" on scores for select using (true);
create policy "Public read special_awards" on special_awards for select using (true);
create policy "Public read photos" on photos for select using (true);
create policy "Public read sponsors" on sponsors for select using (visible = true);
create policy "Public read hall_of_fame" on hall_of_fame for select using (true);
create policy "Public read chat_messages" on chat_messages for select using (true);

-- Insert/update access (teams/players can submit scores, photos, chat)
create policy "Anyone can insert scores" on scores for insert with check (true);
create policy "Anyone can update scores" on scores for update using (true);
create policy "Anyone can insert photos" on photos for insert with check (true);
create policy "Anyone can update photo votes" on photos for update using (true);
create policy "Anyone can insert chat" on chat_messages for insert with check (true);
create policy "Anyone can insert special awards" on special_awards for insert with check (true);
create policy "Anyone can update special awards" on special_awards for update using (true);

-- Service role has full access (admin operations)
-- This is handled automatically by the service role key

-- ============================================================
-- REALTIME
-- ============================================================
-- Enable realtime for live updates
alter publication supabase_realtime add table scores;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table photos;
alter publication supabase_realtime add table special_awards;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run this separately in Supabase dashboard or via API:
-- Create a public bucket called 'tournament-photos'

-- ============================================================
-- SEED DATA (optional — remove before production)
-- ============================================================
insert into tournaments (name, date, course, format, holes, status, handicap_pct)
values (
  'Lorgen Invitational',
  '2026-04-02 15:11:00+02',
  'Banen',
  '2-Mann Scramble',
  18,
  'active',
  25
) on conflict do nothing;
