-- ============================================================
-- IN THE PAINT — Row Level Security Policies
-- Run this AFTER the schema file. Assumes auth.uid() = users.id
-- (i.e. Supabase Auth user id matches your users table id).
-- ============================================================

-- Helper logic used throughout:
-- "is a coach on team X" = exists a team_members row for auth.uid()
--   on team X with role in ('head_coach','assistant_coach')
-- "is on team X at all" = exists a team_members row for auth.uid() on team X (any role)

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
alter table users enable row level security;

create policy "users can read their own row"
on users for select
using (id = auth.uid());

create policy "users can update their own row"
on users for update
using (id = auth.uid());

-- ------------------------------------------------------------
-- ORGANIZATIONS / TEAMS / SEASONS
-- (read-only for members; only coaches can modify)
-- ------------------------------------------------------------
alter table organizations enable row level security;
alter table teams enable row level security;
alter table seasons enable row level security;

create policy "team members can view their org"
on organizations for select
using (
  id in (
    select organization_id from teams
    where id in (select team_id from team_members where user_id = auth.uid())
  )
);

create policy "team members can view their team"
on teams for select
using (
  id in (select team_id from team_members where user_id = auth.uid())
);

create policy "coaches can update their team"
on teams for update
using (
  id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

create policy "team members can view seasons"
on seasons for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "coaches can manage seasons"
on seasons for all
using (
  team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

-- ------------------------------------------------------------
-- TEAM_MEMBERS
-- ------------------------------------------------------------
alter table team_members enable row level security;

create policy "team members can view their team's membership list"
on team_members for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "coaches can manage team membership"
on team_members for all
using (
  team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

-- ------------------------------------------------------------
-- PLAYERS (roster)
-- Coaches: full access on their team.
-- Parents: can view their own kid (matched via team_member_id -> team_members row
--          where invited_by or a future "guardian_of" link applies).
-- For simplicity in Phase 1: parents can view all players on their team,
-- but only coaches can edit. Tighten to "own kid only" later if desired.
-- ------------------------------------------------------------
alter table players enable row level security;

create policy "team members can view roster"
on players for select
using (
  team_member_id in (
    select id from team_members
    where team_id in (select team_id from team_members where user_id = auth.uid())
  )
);

create policy "coaches can manage roster"
on players for all
using (
  team_member_id in (
    select id from team_members
    where team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);

-- ------------------------------------------------------------
-- SCHEDULE EVENTS
-- All team members can view. Only coaches can create/edit/delete.
-- ------------------------------------------------------------
alter table schedule_events enable row level security;

create policy "team members can view schedule"
on schedule_events for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "coaches can manage schedule"
on schedule_events for all
using (
  team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

-- ------------------------------------------------------------
-- RSVPS
-- Team members can view all RSVPs for their team's events.
-- Parents/players can only insert/update their own player's RSVP.
-- Coaches can manage any RSVP on their team.
-- ------------------------------------------------------------
alter table rsvps enable row level security;

create policy "team members can view rsvps"
on rsvps for select
using (
  event_id in (
    select id from schedule_events
    where team_id in (select team_id from team_members where user_id = auth.uid())
  )
);

create policy "users can respond to their own rsvp"
on rsvps for insert
with check (responded_by = auth.uid());

create policy "users can update their own rsvp"
on rsvps for update
using (responded_by = auth.uid());

create policy "coaches can manage all rsvps"
on rsvps for all
using (
  event_id in (
    select id from schedule_events
    where team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);

-- ------------------------------------------------------------
-- CHANNELS / CHANNEL_MEMBERS / MESSAGES
-- ------------------------------------------------------------
alter table channels enable row level security;
alter table channel_members enable row level security;
alter table messages enable row level security;

create policy "team members can view their team's channels"
on channels for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "coaches can manage channels"
on channels for all
using (
  team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

create policy "users can view channel membership for their channels"
on channel_members for select
using (
  channel_id in (select channel_id from channel_members where user_id = auth.uid())
);

create policy "coaches can manage channel membership"
on channel_members for all
using (
  channel_id in (
    select id from channels
    where team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);

create policy "channel members can view messages"
on messages for select
using (
  channel_id in (select channel_id from channel_members where user_id = auth.uid())
);

create policy "channel members can send messages"
on messages for insert
with check (
  sender_id = auth.uid()
  and channel_id in (select channel_id from channel_members where user_id = auth.uid())
);

-- ------------------------------------------------------------
-- GAMES / PLAYER_GAME_STATS
-- All team members can view. Only coaches can edit.
-- ------------------------------------------------------------
alter table games enable row level security;
alter table player_game_stats enable row level security;

create policy "team members can view games"
on games for select
using (
  event_id in (
    select id from schedule_events
    where team_id in (select team_id from team_members where user_id = auth.uid())
  )
);

create policy "coaches can manage games"
on games for all
using (
  event_id in (
    select id from schedule_events
    where team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);

create policy "team members can view stats"
on player_game_stats for select
using (
  game_id in (
    select id from games where event_id in (
      select id from schedule_events
      where team_id in (select team_id from team_members where user_id = auth.uid())
    )
  )
);

create policy "coaches can manage stats"
on player_game_stats for all
using (
  game_id in (
    select id from games where event_id in (
      select id from schedule_events
      where team_id in (
        select team_id from team_members
        where user_id = auth.uid() and role in ('head_coach','assistant_coach')
      )
    )
  )
);

-- ------------------------------------------------------------
-- PLAYS / PLAY_WAYPOINTS
-- All team members can view. Only coaches can edit.
-- ------------------------------------------------------------
alter table plays enable row level security;
alter table play_waypoints enable row level security;

create policy "team members can view plays"
on plays for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "coaches can manage plays"
on plays for all
using (
  team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

create policy "team members can view play waypoints"
on play_waypoints for select
using (
  play_id in (
    select id from plays
    where team_id in (select team_id from team_members where user_id = auth.uid())
  )
);

create policy "coaches can manage play waypoints"
on play_waypoints for all
using (
  play_id in (
    select id from plays
    where team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);

-- ------------------------------------------------------------
-- PRACTICE PLANS
-- All team members can view. Only coaches can edit.
-- ------------------------------------------------------------
alter table practice_plans enable row level security;

create policy "team members can view practice plans"
on practice_plans for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "coaches can manage practice plans"
on practice_plans for all
using (
  team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

-- ------------------------------------------------------------
-- PLAYER_NOTES
-- Private by default. Coaches can always see/manage.
-- Players/parents can only see notes explicitly marked visible_to_player.
-- ------------------------------------------------------------
alter table player_notes enable row level security;

create policy "coaches can manage player notes"
on player_notes for all
using (
  player_id in (
    select p.id from players p
    join team_members tm on tm.id = p.team_member_id
    where tm.team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);

create policy "players can view notes marked visible to them"
on player_notes for select
using (
  visible_to_player = true
  and player_id in (
    select p.id from players p
    join team_members tm on tm.id = p.team_member_id
    where tm.user_id = auth.uid()
  )
);
