import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://iuorczkkpzdvnlcfrfaj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      transport: WebSocket,
    },
  });
  console.log('Supabase client initialized successfully.');
} else {
  console.warn('WARNING: Supabase credentials are missing or still placeholder values. API endpoints will fail until configured.');
}

// Serve static assets from dist folder (production build)
app.use(express.static(path.join(__dirname, 'dist')));

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

// --- API Endpoints ---

// Get Timeline Experience
app.get('/api/timeline', checkSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .select('*')
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
