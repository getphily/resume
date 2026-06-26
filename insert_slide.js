import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-my-custom-header': 'restoring-slide'
    }
  }
});

async function run() {
  const content_data = {
    lead: "Combines deep labor relations expertise with cutting-edge digital communication strategies to amplify voices, build coalitions, and advance economic and social justice.",
    body: "Field representative, former union local president, and digital media producer with 20+ years of experience directing high-impact contract campaigns, building nationwide labor coalitions, and producing viral video/audio podcasts."
  };

  const { data, error } = await supabase
    .from('slides')
    .insert({
      title: 'Professional Summary',
      content_type: 'markdown',
      content_data: content_data,
      is_enabled: true,
      sort_order: 1
    })
    .select();
    
  if (error) console.error("Error:", error);
  else console.log('Inserted:', data);
}

run();
