-- Podcast Cover Studio: cloud storage + saved design.
-- Run this once in the Supabase SQL Editor. It is safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Storage bucket for cover assets (background photo, host photo, final cover)
--    Public read: the final cover must be fetchable by Apple Podcasts / Spotify
--    via the RSS feed. Writes are restricted to each user's own folder.
--    Object layout:  <user_id>/background | <user_id>/host | <user_id>/cover
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'podcast-covers',
  'podcast-covers',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Podcast covers are publicly readable" on storage.objects;
create policy "Podcast covers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'podcast-covers');

drop policy if exists "Users can upload to their own podcast-covers folder" on storage.objects;
create policy "Users can upload to their own podcast-covers folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'podcast-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own podcast-covers files" on storage.objects;
create policy "Users can update their own podcast-covers files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'podcast-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'podcast-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own podcast-covers files" on storage.objects;
create policy "Users can delete their own podcast-covers files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'podcast-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 2. One saved Cover Studio design per user
--    config          = CoverConfig JSON (colors, fonts, positions, zoom...)
--    bg_image_url    = public URL of the uploaded background photo (nullable)
--    host_image_url  = public URL of the host photo / cutout (nullable)
-- ---------------------------------------------------------------------------
create table if not exists public.podcast_cover_designs (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  config         jsonb not null,
  bg_image_url   text,
  host_image_url text,
  updated_at     timestamptz not null default timezone('utc'::text, now())
);

alter table public.podcast_cover_designs enable row level security;

drop policy if exists "Users can read their own cover design" on public.podcast_cover_designs;
create policy "Users can read their own cover design"
  on public.podcast_cover_designs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own cover design" on public.podcast_cover_designs;
create policy "Users can insert their own cover design"
  on public.podcast_cover_designs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cover design" on public.podcast_cover_designs;
create policy "Users can update their own cover design"
  on public.podcast_cover_designs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own cover design" on public.podcast_cover_designs;
create policy "Users can delete their own cover design"
  on public.podcast_cover_designs for delete
  using (auth.uid() = user_id);
