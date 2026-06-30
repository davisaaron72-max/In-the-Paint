-- ============================================================
-- IN THE PAINT — Schema Addition: Photos / Gallery
-- Run after the base schema + RLS policy files.
-- ============================================================

create table photos (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  season_id uuid references seasons(id),
  message_id uuid references messages(id) on delete set null, -- set when uploaded via chat attachment
  uploaded_by uuid references users(id),
  storage_path text not null,       -- path within the Supabase Storage 'team-photos' bucket
  caption text,
  created_at timestamptz default now()
);

alter table photos enable row level security;

create policy "team members can view team photos"
on photos for select
using (
  team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "team members can upload photos"
on photos for insert
with check (
  uploaded_by = auth.uid()
  and team_id in (select team_id from team_members where user_id = auth.uid())
);

create policy "uploader or coach can delete a photo"
on photos for delete
using (
  uploaded_by = auth.uid()
  or team_id in (
    select team_id from team_members
    where user_id = auth.uid() and role in ('head_coach','assistant_coach')
  )
);

-- ============================================================
-- SUPABASE STORAGE SETUP (do this in the Supabase dashboard, not SQL):
-- 1. Go to Storage in the left sidebar
-- 2. Create a new bucket named: team-photos
-- 3. Set it to "Private" (not public) -- access is controlled by the
--    storage policies below, same role logic as the photos table.
-- 4. After creating the bucket, run the storage policies below.
-- ============================================================

create policy "team members can view team photo files"
on storage.objects for select
using (
  bucket_id = 'team-photos'
  and (storage.foldername(name))[1] in (
    select team_id::text from team_members where user_id = auth.uid()
  )
);

create policy "team members can upload team photo files"
on storage.objects for insert
with check (
  bucket_id = 'team-photos'
  and (storage.foldername(name))[1] in (
    select team_id::text from team_members where user_id = auth.uid()
  )
);

-- NOTE: file path convention to follow in the app code:
-- team-photos/{team_id}/{uuid}.jpg
-- The {team_id} as the first folder segment is what the policies above check against.
