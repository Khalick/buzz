import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efhdwksunwiawdbkihjy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_kWPMK3c2KiAMF_QfIYA5aQ_eteq1WGC';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: cols, error: err } = await supabase.from('businesses').select('*').limit(1);
  console.log("Columns:", cols ? Object.keys(cols[0]) : "none", "Error:", err);
}
run();
