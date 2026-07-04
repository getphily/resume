import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // 1. Check and insert variant slogans
  console.log("Upserting slogan overrides in app_settings...");
  const { data: upsertData, error: upsertErr } = await supabase
    .from('app_settings')
    .upsert([
      { key: 'slogan_aaup', value: 'Digital Media Producer & Labor Communications Strategist' },
      { key: 'slogan_labor', value: 'Senior Labor Relations Representative & Collective Bargaining Expert' }
    ]);
  
  if (upsertErr) {
    console.error("Error upserting slogans:", upsertErr);
  } else {
    console.log("Slogans upserted successfully!");
  }

  // 2. Fetch app_settings entries
  const { data: settings, error: settingsErr } = await supabase.from('app_settings').select('*');
  console.log("Current app_settings entries:", settings);

  // 3. Inspect skills table columns
  console.log("Inspecting skills table columns...");
  const { data: skills, error: skillsErr } = await supabase.from('skills').select('*').limit(1);
  if (skillsErr) {
    console.error("Error fetching skills:", skillsErr);
  } else {
    console.log("Sample skill row:", skills[0]);
  }

  // 4. Inspect competencies table columns
  console.log("Inspecting competencies table columns...");
  const { data: competencies, error: competenciesErr } = await supabase.from('competencies').select('*').limit(1);
  if (competenciesErr) {
    console.error("Error fetching competencies:", competenciesErr);
  } else {
    console.log("Sample competency row:", competencies[0]);
  }
}

run();
