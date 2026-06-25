import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import multer from 'multer';
import bcrypt from 'bcryptjs';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// multer — memory storage for file uploads (buffer sent to Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 52_428_800 }, // 50 MB
});

// Initialize Supabase Client (public/anon — read-only, RLS enforced)
const supabaseUrl    = process.env.SUPABASE_URL     || 'https://iuorczkkpzdvnlcfrfaj.supabase.co';
const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { transport: WebSocket },
  });
  console.log('Supabase public client initialized.');
} else {
  console.warn('WARNING: Supabase anon credentials missing. API read endpoints will fail.');
}

// Admin client — bypasses RLS, server-side only, never exposed to browser
let supabaseAdmin = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    realtime: { transport: WebSocket },
    auth: { persistSession: false },
  });
  console.log('Supabase admin client initialized (service role).');
} else {
  console.warn('WARNING: SUPABASE_SERVICE_KEY missing. Admin write operations will be unavailable.');
}


// Serve static assets from dist folder (production build)
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

// Helper middleware to check Supabase client connection
const checkSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Database Service Unavailable',
      message: 'Supabase credentials are not configured. Please paste your anon key in the local .env file.'
    });
  }
  next();
};

// Admin auth middleware — verifies X-Admin-Password header against bcrypt hash in DB
const checkAdmin = async (req, res, next) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Admin client not available' });
  }
  const password = req.headers['x-admin-password'];
  if (!password) {
    return res.status(401).json({ error: 'Missing X-Admin-Password header' });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_password_hash')
      .single();
    if (error || !data) return res.status(401).json({ error: 'Admin not configured' });
    const valid = await bcrypt.compare(password, data.value);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: detect file_type from mime
function detectFileType(mime) {
  if (!mime) return 'image';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  return 'image';
}

// --- API Endpoints ---

// Get Timeline Experience
app.get('/api/timeline', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .select('*')
      .neq('id', 'north-coast-trust')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching timeline:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// Get Podcast Listings
app.get('/api/podcasts', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching podcasts:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// Get Portfolio Items
app.get('/api/portfolio', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// Get Social Media Links
app.get('/api/socials', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('socials')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching socials:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// Get Skills Inventory
app.get('/api/skills', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching skills:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// Get Education
app.get('/api/education', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching education:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// Get Represented Employers
app.get('/api/employers', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employers')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching employers:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// Get Core & Strategic Competencies
app.get('/api/competencies', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('competencies')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching competencies:', error.message);
    res.status(500).json({ error: 'Database query failed', message: error.message });
  }
});

// ─── Media Library — Public ───────────────────────────────────────────────────

// GET /api/media  — list assets; filter by ?job_id=
app.get('/api/media', checkSupabase, async (req, res) => {
  try {
    let q = supabase
      .from('media_assets')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (req.query.job_id) q = q.eq('timeline_job_id', req.query.job_id);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Media Library — Admin ────────────────────────────────────────────────────

// POST /api/admin/auth  — verify password
app.post('/api/admin/auth', checkAdmin, (_req, res) => {
  res.json({ ok: true });
});

// POST /api/admin/media/upload  — upload file to Supabase Storage + insert row
app.post('/api/admin/media/upload', checkAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  if (!supabaseAdmin) return res.status(503).json({ error: 'Admin client unavailable' });

  try {
    const { originalname, buffer, mimetype } = req.file;
    const ext = originalname.split('.').pop().replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
    // Strip accents, replace all non-alphanumeric/dot/dash/underscore with _, collapse multiples
    const safeName = originalname
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents
      .replace(/\.[^.]+$/, '')                            // remove extension (re-add below)
      .replace(/[^\w\-]/g, '_')                           // non-word chars → _
      .replace(/_+/g, '_')                                // collapse runs
      .replace(/^_+|_+$/g, '')                            // trim edges
      .toLowerCase() || 'file';
    const storagePath = `uploads/${Date.now()}-${safeName}.${ext}`;
    const fileType = detectFileType(mimetype);

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('media-assets')
      .upload(storagePath, buffer, { contentType: mimetype, upsert: false });
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabaseAdmin.storage
      .from('media-assets')
      .getPublicUrl(storagePath);

    // Parse metadata from form body
    const {
      timeline_job_id, caption, keywords,
      location_label, location_lat, location_lng, sort_order,
    } = req.body;

    const keywordsArr = keywords
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    const { data, error: insertErr } = await supabaseAdmin
      .from('media_assets')
      .insert({
        timeline_job_id: timeline_job_id || null,
        filename: originalname,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        file_type: fileType,
        mime_type: mimetype,
        caption: caption || null,
        keywords: keywordsArr,
        location_label: location_label || null,
        location_lat: location_lat ? parseFloat(location_lat) : null,
        location_lng: location_lng ? parseFloat(location_lng) : null,
        sort_order: sort_order ? parseInt(sort_order) : 0,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    res.json(data);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/media/:id  — update metadata
// ── Bulk routes must come BEFORE /:id wildcards ───────────────────────────────

// PATCH /api/admin/media/bulk-assign — assign job + optionally add keywords to many assets
app.patch('/api/admin/media/bulk-assign', checkAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Admin client unavailable' });
  const { ids, jobId, keywords, keywordMode } = req.body;
  // keywords: string[] of tags to add/set; keywordMode: 'append' (default) | 'replace'
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  try {
    const updates = {};
    if (jobId !== undefined) updates.timeline_job_id = jobId || null;

    if (Array.isArray(keywords) && keywords.length > 0) {
      if (keywordMode === 'replace') {
        // Set keywords directly on all selected
        updates.keywords = keywords;
      } else {
        // Append mode: fetch existing keywords and merge per-record
        const { data: existing } = await supabaseAdmin
          .from('media_assets').select('id, keywords').in('id', ids);
        for (const row of (existing || [])) {
          const merged = [...new Set([...(row.keywords || []), ...keywords])];
          await supabaseAdmin.from('media_assets')
            .update({ keywords: merged }).eq('id', row.id).select('id');
        }
        // jobId update still applies to all below
        if (Object.keys(updates).length > 0) {
          const { error } = await supabaseAdmin
            .from('media_assets').update(updates).in('id', ids).select('id');
          if (error) throw error;
        }
        return res.json({ updated: ids.length });
      }
    }

    const { error } = await supabaseAdmin
      .from('media_assets')
      .update(updates)
      .in('id', ids)
      .select('id');
    if (error) throw error;
    res.json({ updated: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/media/bulk-delete — delete many assets from storage + DB
app.delete('/api/admin/media/bulk-delete', checkAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Admin client unavailable' });
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  try {
    const { data: assets, error: fetchErr } = await supabaseAdmin
      .from('media_assets').select('id, storage_path').in('id', ids);
    if (fetchErr) throw fetchErr;

    const paths = assets.map(a => a.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await supabaseAdmin.storage.from('media-assets').remove(paths);
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('media_assets').delete().in('id', ids);
    if (deleteErr) throw deleteErr;

    res.json({ deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Single-asset routes (/:id wildcards go AFTER specific paths) ──────────────

// PATCH /api/admin/media/:id  — update metadata
app.patch('/api/admin/media/:id', checkAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Admin client unavailable' });
  try {
    const { timeline_job_id, caption, keywords, location_label, location_lat, location_lng, sort_order } = req.body;
    const keywordsArr = typeof keywords === 'string'
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : (keywords || undefined);

    const updates = {};
    if (timeline_job_id !== undefined) updates.timeline_job_id = timeline_job_id || null;
    if (caption       !== undefined) updates.caption = caption || null;
    if (keywordsArr   !== undefined) updates.keywords = keywordsArr;
    if (location_label !== undefined) updates.location_label = location_label || null;
    if (location_lat  !== undefined) updates.location_lat = location_lat ? parseFloat(location_lat) : null;
    if (location_lng  !== undefined) updates.location_lng = location_lng ? parseFloat(location_lng) : null;
    if (sort_order    !== undefined) updates.sort_order = parseInt(sort_order);

    const { data, error } = await supabaseAdmin
      .from('media_assets')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/media/:id  — remove file from storage + delete row
app.delete('/api/admin/media/:id', checkAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Admin client unavailable' });
  try {
    const { data: asset, error: fetchErr } = await supabaseAdmin
      .from('media_assets')
      .select('storage_path')
      .eq('id', req.params.id)
      .single();
    if (fetchErr) throw fetchErr;

    await supabaseAdmin.storage.from('media-assets').remove([asset.storage_path]);

    const { error: deleteErr } = await supabaseAdmin
      .from('media_assets')
      .delete()
      .eq('id', req.params.id);
    if (deleteErr) throw deleteErr;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/password  — change admin password
app.put('/api/admin/password', checkAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Admin client unavailable' });
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert({ key: 'admin_password_hash', value: hash });
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback endpoint for Spa routing
app.get('*', (req, res, next) => {
  if (req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

