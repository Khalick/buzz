import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efhdwksunwiawdbkihjy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_kWPMK3c2KiAMF_QfIYA5aQ_eteq1WGC';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log("Checking if pos_categories exists...");
  const catRes = await supabase.from('pos_categories').select('id').limit(1);
  console.log("pos_categories response:", catRes);

  console.log("Checking if pos_products exists...");
  const prodRes = await supabase.from('pos_products').select('id').limit(1);
  console.log("pos_products response:", prodRes);
}

testQuery();
