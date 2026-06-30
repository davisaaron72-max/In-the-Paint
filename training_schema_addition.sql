-- ============================================================
-- IN THE PAINT — Schema Addition: Training (Workouts + Skill Videos)
-- Supports both team-wide drills and per-player individual plans.
-- Run after the base schema + RLS policy files.
-- ============================================================

create table training_content (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  season_id uuid references seasons(id),
  created_by uuid references users(id),
  title text not null,
  content_type text not null check (content_type in ('workout', 'skill_video')),
  scope text not null check (scope in ('team', 'individual')),
  assigned_player_id uuid references players(id), -- set only when scope = 'individual'
  description text,
  video_url text,                  -- used when content_type = 'skill_video'
  created_at timestamptz default now()
);

-- exercises only apply to content_type = 'workout', same pattern as DavisFit
create table training_exercises (
  id uuid primary key default gen_random_uuid(),
  training_content_id uuid references training_content(id) on delete cascade,
  name text not null,
  sets int,
  reps text,                       -- text to allow "8-10" style ranges, same as DavisFit convention
  notes text,
  order_index int default 0
);

alter table training_content enable row level security;
alter table training_exercises enable row level security;

-- Team members can view team-wide content, or individual content assigned to them
create policy "team members can view relevant training content"
on training_content for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
  and (
    scope = 'team'
    or assigned_player_id in (
      select p.id from players p
      join team_members tm on tm.id = p.team_member_id
      where tm.user_id = auth.uid()
    )
    or team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);

create policy "coaches can manage training content"
on training_content for all
using (
  team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

create policy "team members can view relevant exercises"
on training_exercises for select
using (
  training_content_id in (
    select id from training_content
    where team_id in (select team_id from team_members where user_id = auth.uid())
  )
);

create policy "coaches can manage exercises"
on training_exercises for all
using (
  training_content_id in (
    select id from training_content
    where team_id in (
      select team_id from team_members
      where user_id = auth.uid() and role in ('head_coach','assistant_coach')
    )
  )
);
