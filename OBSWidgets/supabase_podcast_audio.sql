-- Podcast Audio Studio: cloud storage for edited recordings.
-- Run this once in the Supabase SQL Editor. It is safe to re-run.
--
-- Private bucket (recordings are unpublished drafts). Each user can only read/write
-- inside their own folder:  <user_id>/<file>.wav
-- 50 MB limit matches the default Supabase per-file cap (~5 min of stereo 44.1 kHz WAV).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'podcast-audio',
  'podcast-audio',
  false,
  52428800, -- 50 MB
  array['audio/wav', 'audio/x-wav', 'audio/wave']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their own podcast-audio files" on storage.objects;
create policy "Users can read their own podcast-audio files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'podcast-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload to their own podcast-audio folder" on storage.objects;
create policy "Users can upload to their own podcast-audio folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'podcast-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own podcast-audio files" on storage.objects;
create policy "Users can update their own podcast-audio files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'podcast-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'podcast-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own podcast-audio files" on storage.objects;
create policy "Users can delete their own podcast-audio files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'podcast-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
