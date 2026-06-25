/**
 * reingest_storage.mjs
 * Scans the Supabase Storage bucket and re-creates media_assets DB records
 * for any files that exist in storage but are missing from the table.
 *
 * Run once: node scripts/reingest_storage.mjs
 */

import '@dotenvx/dotenvx/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET               = 'media-assets';
const PREFIX               = 'uploads/';
const PUBLIC_BASE          = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function mimeToType(mime = '') {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  return 'other';
}

async function listAllFiles(prefix) {
  const files = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const { data, error } = await admin.storage.from(BUCKET).list(prefix, { limit, offset, sortBy: { column: 'created_at', order: 'asc' } });
    if (error) { console.error('Storage list error:', error.message); break; }
    if (!data || data.length === 0) break;
    files.push(...data.filter(f => f.id)); // id=null means it's a folder
    if (data.length < limit) break;
    offset += limit;
  }
  return files;
}

async function main() {
  console.log('🔍 Scanning Supabase Storage...');
  const storageFiles = await listAllFiles(PREFIX.replace(/\/$/, ''));
  console.log(`   Found ${storageFiles.length} files in storage`);

  // Get existing DB records so we don't double-insert
  const { data: existing } = await admin.from('media_assets').select('storage_path');
  const existingPaths = new Set((existing || []).map(r => r.storage_path));
  console.log(`   ${existingPaths.size} records already in media_assets table`);

  const toInsert = storageFiles.filter(f => {
    const path = `${PREFIX}${f.name}`;
    return !existingPaths.has(path);
  });
  console.log(`   ${toInsert.length} files need re-ingesting\n`);

  if (toInsert.length === 0) {
    console.log('All storage files already have DB records.');
    return;
  }

  let inserted = 0, failed = 0;
  for (const file of toInsert) {
    const storagePath = `${PREFIX}${file.name}`;
    const publicUrl   = `${PUBLIC_BASE}${PREFIX}${file.name}`;
    const mime        = file.metadata?.mimetype || '';
    const fileType    = mimeToType(mime);
    const fileSize    = file.metadata?.size || 0;

    const record = {
      filename:          file.name,
      storage_path:      storagePath,
      public_url:        publicUrl,
      file_type:         fileType,
      mime_type:         mime,
      file_size:         fileSize,
      caption:           '',
      keywords:          [],
      lat:               null,
      lng:               null,
      location_label:    '',
      timeline_job_id:   null,
    };

    const { error } = await admin.from('media_assets').insert(record);
    if (error) {
      console.error(`  ERROR ${file.name}: ${error.message}`);
      failed++;
    } else {
      console.log(`  OK ${file.name} (${fileType}, ${Math.round(fileSize / 1024)}KB)`);
      inserted++;
    }
  }

  console.log(`\nDone: ${inserted} records inserted, ${failed} failed.`);
}

main().catch(console.error);
