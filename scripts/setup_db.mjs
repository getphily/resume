/**
 * scripts/setup_db.mjs
 * Run once to create media tables, storage bucket, and seed default admin password.
 * Usage: node scripts/setup_db.mjs
 */

import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});

// ── 1. Check tables ───────────────────────────────────────────────────────────
console.log('\n📦  Checking database tables...');

const { error: mediaErr } = await admin.from('media_assets').select('id').limit(1);
if (mediaErr && mediaErr.code === '42P01') {
  console.log('   ⚠️  media_assets table not found.');
  console.log('   → Run the "MEDIA LIBRARY TABLES" section at the bottom of supabase_setup.sql in the Supabase SQL editor first.');
  process.exit(1);
} else if (mediaErr) {
  console.log('   media_assets:', mediaErr.message);
} else {
  console.log('   ✓ media_assets table exists');
}

const { error: settingsErr } = await admin.from('app_settings').select('key').limit(1);
if (settingsErr && settingsErr.code === '42P01') {
  console.log('   ⚠️  app_settings table not found — same SQL block will create it.');
  process.exit(1);
} else if (settingsErr) {
  console.log('   app_settings:', settingsErr.message);
} else {
  console.log('   ✓ app_settings table exists');
}

// ── 2. Create storage bucket ──────────────────────────────────────────────────
console.log('\n🪣  Setting up storage bucket...');
const { data: buckets } = await admin.storage.listBuckets();
const bucketExists = buckets?.some(b => b.name === 'media-assets');

if (!bucketExists) {
  const { error: bucketErr } = await admin.storage.createBucket('media-assets', {
    public: true,
    allowedMimeTypes: ['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/quicktime','video/webm','application/pdf'],
    fileSizeLimit: 52428800,
  });
  if (bucketErr) {
    console.error('   ❌  Bucket creation failed:', bucketErr.message);
  } else {
    console.log('   ✓ media-assets bucket created (public, 50MB limit)');
  }
} else {
  console.log('   ✓ media-assets bucket already exists');
}

// ── 3. Seed default admin password ───────────────────────────────────────────
console.log('\n🔐  Seeding admin password...');
const DEFAULT_PASSWORD = 'resume@admin1021';

const { data: existing, error: readErr } = await admin
  .from('app_settings')
  .select('value')
  .eq('key', 'admin_password_hash')
  .maybeSingle();

if (readErr) {
  console.error('   ❌  Could not read app_settings:', readErr.message);
} else if (existing) {
  console.log('   ✓ Admin password hash already seeded (keeping existing)');
} else {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const { error: seedErr } = await admin
    .from('app_settings')
    .insert({ key: 'admin_password_hash', value: hash });
  if (seedErr) {
    console.error('   ❌  Seed failed:', seedErr.message);
  } else {
    console.log(`   ✓ Default admin password seeded: ${DEFAULT_PASSWORD}`);
  }
}

console.log('\n✅  Setup complete!\n');
