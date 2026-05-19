import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log("Users:", users?.users?.map(u => ({ id: u.id, email: u.email })));

  const { data: businesses } = await supabase.from('businesses').select('id, name, owner_id');
  console.log("Businesses:", businesses);
}
check();
