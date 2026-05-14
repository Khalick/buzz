require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: users, error: err1 } = await supabase.from('users').select('*').limit(1);
  if (err1) { console.error("Error fetching user:", err1); return; }
  if (!users || users.length === 0) { console.log("No users found."); return; }
  
  const userId = users[0].id;
  console.log("Found user:", users[0].email, userId);

  const { data: biz, error: err2 } = await supabase.from('businesses').select('*').eq('owner_id', userId).single();
  if (biz) {
    console.log("Business already exists:", biz.id);
  } else {
    const { data: newBiz, error: err3 } = await supabase.from('businesses').insert({
      owner_id: userId,
      name: 'Test Electronics',
      category: 'Retail',
      description: 'A test store',
      location: 'Nairobi',
      phone: '0712345678',
      email: users[0].email,
      status: 'active'
    }).select().single();
    if (err3) { console.error("Error creating business:", err3); }
    else { console.log("Created dummy business:", newBiz.id); }
  }
}
main();
