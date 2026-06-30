-- ============================================================
-- IN THE PAINT — Supabase Schema (Phase 1 + stubs for Phase 2-4)
-- AAU Travel Basketball Team App
-- Built single-team (Sandhills Ballers) but designed to scale
-- to multiple teams/organizations later.
-- ============================================================

-- ------------------------------------------------------------
-- ORGANIZATIONS & TEAMS
-- ------------------------------------------------------------

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- e.g. "Sandhills Basketball Club"
  created_at timestamptz default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,               -- e.g. "Sandhills Ballers"
  age_group text,                   -- e.g. "U12", null for now, used when multi-team
  color_hex text,                   -- optional team-level color (for multi-team views)
  created_at timestamptz default now()
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,               -- e.g. "2026-2027 Season"
  start_date date,
  end_date date,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- USERS & ROLES
-- ------------------------------------------------------------

create table users (
  id uuid primary key default gen_random_uuid(), -- matches auth.users.id
  full_name text not null,
  email text unique,
  phone text unique,
  avatar_url text,
  created_at timestamptz default now()
);

-- a user can have different roles on different teams (e.g. coach on one, parent on another)
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null check (role in ('head_coach', 'assistant_coach', 'parent', 'player')),
  -- head_coach and assistant_coach have identical full-admin permissions in app logic
  color_hex text,                   -- per-player color (jersey/UI accent), set for player role
  invited_by uuid references users(id),
  joined_at timestamptz default now(),
  unique (team_id, user_id, role)
);

-- ------------------------------------------------------------
-- ROSTER (player-specific profile data, season-scoped)
-- ------------------------------------------------------------

create table players (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid references team_members(id) on delete cascade, -- links to the 'player' role row
  season_id uuid references seasons(id) on delete cascade,
  jersey_number text,
  position text,                    -- one primary position, free text or enum later (PG/SG/SF/PF/C)
  parent_contact_name text,
  parent_contact_phone text,
  parent_contact_email text,
  photo_url text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- SCHEDULE
-- ------------------------------------------------------------

create table schedule_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  season_id uuid references seasons(id) on delete cascade,
  event_type text not null check (event_type in ('game', 'practice', 'tournament', 'other')),
  game_type text check (game_type in ('league', 'tournament', null)),
  opponent text,
  location_name text,
  location_link text,               -- maps link
  home_or_away text check (home_or_away in ('home', 'away', null)),
  uniform_color text,
  start_time timestamptz not null,
  end_time timestamptz,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- RSVP / AVAILABILITY
-- ------------------------------------------------------------

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references schedule_events(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  responded_by uuid references users(id), -- could be the parent or the player's own user account
  status text not null check (status in ('yes', 'no', 'maybe', 'pending')) default 'pending',
  responded_at timestamptz default now(),
  unique (event_id, player_id)
);

-- ------------------------------------------------------------
-- ANNOUNCEMENTS / CHAT (Phase 1: one team-wide thread + DMs)
-- ------------------------------------------------------------

create table channels (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  type text not null check (type in ('team_wide', 'dm')),
  -- Phase 1 only creates one 'team_wide' channel per team.
  -- Multi-channel (carpool, game-day, etc.) is a roadmap item — same table supports it later
  -- by just adding more rows with a 'name' value.
  name text,                        -- null for team_wide default, used for future sub-channels
  created_at timestamptz default now()
);

create table channel_members (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  unique (channel_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  sender_id uuid references users(id),
  body text,
  send_push boolean default false,  -- per-message decision: push (Pushover) + in-app, or in-app only
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- GAME RESULTS (supports both post-game entry now and live entry later)
-- ------------------------------------------------------------

create table games (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references schedule_events(id) on delete cascade, -- links to schedule_events where event_type='game'
  team_score int,
  opponent_score int,
  status text not null check (status in ('scheduled', 'in_progress', 'final')) default 'scheduled',
  entry_mode text check (entry_mode in ('post_game', 'live')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------
-- STATS (Phase 2 — stubbed now, season-scoped)
-- ------------------------------------------------------------

create table player_game_stats (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  points int default 0,
  rebounds int default 0,
  assists int default 0,
  steals int default 0,
  blocks int default 0,
  turnovers int default 0,
  fouls int default 0,
  created_at timestamptz default now(),
  unique (game_id, player_id)
);

-- ------------------------------------------------------------
-- PLAYS / ANIMATED PLAYS BOARD (Phase 4 — stubbed now)
-- ------------------------------------------------------------

create table plays (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  name text not null,               -- e.g. "Horns", "Zipper", "Box & 1"
  description text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table play_waypoints (
  id uuid primary key default gen_random_uuid(),
  play_id uuid references plays(id) on delete cascade,
  -- position_label identifies which of the 5 spots this path belongs to (1-5), or a player_id once assigned
  position_label text not null,
  player_id uuid references players(id), -- nullable: plays can be drawn generically before assigning real players
  is_ball boolean default false,    -- true = this row represents ball movement, not a player path
  sequence jsonb not null,          -- array of {x, y, timestamp} points
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- PRACTICE PLANS / WORKOUTS (Phase 4 — stubbed now)
-- ------------------------------------------------------------

create table practice_plans (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  event_id uuid references schedule_events(id), -- optional link to a practice on the schedule
  title text,
  agenda text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- PRIVATE PLAYER DEVELOPMENT NOTES (Phase 4 — stubbed now)
-- ------------------------------------------------------------

create table player_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  coach_id uuid references users(id),
  note text,
  visible_to_player boolean default false, -- coach decides if note is shared
  created_at timestamptz default now()
);
