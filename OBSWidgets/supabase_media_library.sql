-- =========================================================================================
-- Media Library Schema & Policies
-- Run this script in the Supabase SQL Editor.
-- =========================================================================================

-- 1. Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media-library',
  'media-library',
  false,
  209715200, -- 200 MB max for video
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/webm',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2. Add Storage Quota to Profiles
alter table public.profiles add column if not exists storage_quota_bytes bigint not null default 1073741824; -- 1GB default

-- 3. Media Assets Table
create table if not exists public.media_assets (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade,
  kind             text not null check (kind in ('image','audio','video')),
  status           text not null default 'uploading' check (status in ('uploading','ready','failed')),
  title            text not null,
  original_name    text not null,
  mime_type        text not null,
  size_bytes       bigint not null,
  storage_bucket   text not null default 'media-library',
  storage_path     text not null unique,
  thumb_path       text,
  width            int, 
  height           int, 
  duration_ms      int,
  peaks            jsonb,
  checksum         text,
  source           text not null default 'upload' check (source in ('upload','cover-studio','audio-editor','recording','import')),
  is_favorite      boolean not null default false,
  tags             text[] not null default '{}',
  public_path      text,
  metadata         jsonb not null default '{}',
  last_used_at     timestamptz,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes
create index if not exists idx_media_assets_user_id on public.media_assets (user_id, deleted_at, created_at desc, id);
create index if not exists idx_media_assets_kind on public.media_assets (user_id, kind);
create index if not exists idx_media_assets_tags on public.media_assets using gin (tags);

-- 4. Media Usages Table
create table if not exists public.media_usages (
  asset_id uuid references public.media_assets on delete cascade,
  user_id  uuid not null,
  tool     text not null,
  ref_id   text not null,
  created_at timestamptz default now(),
  primary key (asset_id, tool, ref_id)
);

-- 5. Collections
create table if not exists public.media_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null, 
  created_at timestamptz default now(),
  unique (user_id, name)
);

create table if not exists public.media_collection_items (
  collection_id uuid references public.media_collections on delete cascade,
  asset_id uuid references public.media_assets on delete cascade,
  primary key (collection_id, asset_id)
);

-- Enable RLS
alter table public.media_assets enable row level security;
alter table public.media_usages enable row level security;
alter table public.media_collections enable row level security;
alter table public.media_collection_items enable row level security;

-- 6. RLS Policies
drop policy if exists "Users can select their own media_assets" on public.media_assets;
create policy "Users can select their own media_assets" on public.media_assets for select using (auth.uid() = user_id);

drop policy if exists "Users can update their own media_assets" on public.media_assets;
create policy "Users can update their own media_assets" on public.media_assets for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own media_assets" on public.media_assets;
create policy "Users can delete their own media_assets" on public.media_assets for delete using (auth.uid() = user_id);

-- Storage bucket RLS
drop policy if exists "Users can read their own media-library files" on storage.objects;
create policy "Users can read their own media-library files"
  on storage.objects for select to authenticated
  using (bucket_id = 'media-library' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can upload to their own media-library folder" on storage.objects;
create policy "Users can upload to their own media-library folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media-library'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.media_assets 
      where storage_path = name 
        and user_id = auth.uid() 
        and status = 'uploading'
    )
  );

drop policy if exists "Users can update their own media-library files" on storage.objects;
create policy "Users can update their own media-library files"
  on storage.objects for update to authenticated
  using (bucket_id = 'media-library' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'media-library' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own media-library files" on storage.objects;
create policy "Users can delete their own media-library files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media-library' and (storage.foldername(name))[1] = auth.uid()::text);

-- 7. RPCs (Security Definer)

-- Reserve Media Asset
create or replace function public.reserve_media_asset(
  p_kind text, 
  p_mime text, 
  p_size bigint, 
  p_name text,
  p_source text default 'upload'
)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid;
  v_used bigint;
  v_quota bigint;
  v_id uuid;
  v_path text;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'Unauthorized'; end if;

  -- Check quota
  select storage_quota_bytes into v_quota from profiles where id = v_uid;
  if v_quota is null then v_quota := 1073741824; end if;

  select coalesce(sum(size_bytes), 0) into v_used from media_assets where user_id = v_uid and deleted_at is null and status = 'ready';

  if v_used + p_size > v_quota then
    raise exception 'Storage quota exceeded. Used % bytes out of % bytes limit.', v_used, v_quota;
  end if;

  v_id := gen_random_uuid();
  v_path := v_uid::text || '/' || v_id::text || '/' || p_name;

  insert into media_assets (
    id, user_id, kind, status, title, original_name, mime_type, size_bytes, storage_path, source
  ) values (
    v_id, v_uid, p_kind, 'uploading', p_name, p_name, p_mime, p_size, v_path, p_source
  );

  return json_build_object('id', v_id, 'storage_path', v_path);
end;
$$;

-- Finalize Media Asset
create or replace function public.finalize_media_asset(
  p_id uuid,
  p_thumb_path text default null,
  p_width int default null,
  p_height int default null,
  p_duration_ms int default null,
  p_peaks jsonb default null
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid;
  v_asset media_assets%rowtype;
  v_real_size bigint;
  v_used bigint;
  v_quota bigint;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'Unauthorized'; end if;

  select * into v_asset from media_assets where id = p_id and user_id = v_uid;
  if not found then raise exception 'Asset not found'; end if;
  if v_asset.status = 'ready' then return; end if; -- idempotent

  -- The client uploaded it. Get real size from storage.objects
  select coalesce(metadata->>'size', '0')::bigint into v_real_size 
  from storage.objects 
  where bucket_id = 'media-library' and name = v_asset.storage_path;

  if v_real_size is null or v_real_size = 0 then
    -- It could be a chunked upload assembling, or we trust the reservation if storage object metadata is delayed
    v_real_size := v_asset.size_bytes; 
  end if;

  -- Re-check quota with real size
  select storage_quota_bytes into v_quota from profiles where id = v_uid;
  select coalesce(sum(size_bytes), 0) into v_used from media_assets where user_id = v_uid and deleted_at is null and status = 'ready';

  if v_used + v_real_size > v_quota then
    -- Fail it
    update media_assets set status = 'failed', size_bytes = v_real_size, updated_at = now() where id = p_id;
    raise exception 'Storage quota exceeded during finalization.';
  end if;

  update media_assets set
    status = 'ready',
    size_bytes = v_real_size,
    thumb_path = p_thumb_path,
    width = p_width,
    height = p_height,
    duration_ms = p_duration_ms,
    peaks = p_peaks,
    updated_at = now()
  where id = p_id;
end;
$$;

-- Storage Summary
create or replace function public.media_storage_summary()
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid;
  v_quota bigint;
  v_used bigint;
  v_images bigint;
  v_audio bigint;
  v_video bigint;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'Unauthorized'; end if;

  select storage_quota_bytes into v_quota from profiles where id = v_uid;
  if v_quota is null then v_quota := 1073741824; end if;

  select coalesce(sum(size_bytes), 0) into v_used from media_assets where user_id = v_uid and deleted_at is null and status = 'ready';
  select coalesce(sum(size_bytes), 0) into v_images from media_assets where user_id = v_uid and kind = 'image' and deleted_at is null and status = 'ready';
  select coalesce(sum(size_bytes), 0) into v_audio from media_assets where user_id = v_uid and kind = 'audio' and deleted_at is null and status = 'ready';
  select coalesce(sum(size_bytes), 0) into v_video from media_assets where user_id = v_uid and kind = 'video' and deleted_at is null and status = 'ready';

  return json_build_object(
    'quota', v_quota,
    'used', v_used,
    'images', v_images,
    'audio', v_audio,
    'video', v_video
  );
end;
$$;
