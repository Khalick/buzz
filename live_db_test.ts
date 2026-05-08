import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efhdwksunwiawdbkihjy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kWPMK3c2KiAMF_QfIYA5aQ_eteq1WGC'; // User's Anon Key
const JWT = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImUzZTRlYzU2LTg2YTQtNGVjMC05MGNiLTcxNjJjZjA0NWE4NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2VmaGR3a3N1bndpYXdkYmtpaGp5LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI4NTc0YWFmNy0zODc4LTQ1ZDgtYmY4ZC1jMDRlNmNlYjFkYWUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4MTg1MDgxLCJpYXQiOjE3NzgxODE0ODEsImVtYWlsIjoicGV0ZXJhZ2FrNjFAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCIsImdvb2dsZSJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmk4UjdkSnR3RzJSNzg3Y294blV4M29RQ0lVam91ZnVRaFM2SzlUQWR5UFNLNkFBPXM5Ni1jIiwiZW1haWwiOiJwZXRlcmFnYWs2MUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQWdhayBQZXRlciIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJBZ2FrIFBldGVyIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSmk4UjdkSnR3RzJSNzg3Y294blV4M29RQ0lVam91ZnVRaFM2SzlUQWR5UFNLNkFBPXM5Ni1jIiwicHJvdmlkZXJfaWQiOiIxMTYwNjg0NzA1NTkyNDA0MTYxMjYiLCJzdWIiOiIxMTYwNjg0NzA1NTkyNDA0MTYxMjYifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3ODE0NzgzMX1dLCJzZXNzaW9uX2lkIjoiMDI3ZDJlYWQtZWM3My00NWRiLTlmMDQtZjk5OGFiODRkMWQ0IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.U5ifrVPpw0tAUQWROsQtV4ivXLRvyamCzOZ7AElxYAjrcvrYW0Tt-8pZE0YFgMYMEj_K8_4vvBNtYaDoaUywpg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: {
    headers: {
      Authorization: `Bearer ${JWT}`
    }
  }
});

async function runTests() {
  console.log("Starting diagnostics...");

  // 1. Check if the user is an admin by querying their own users record
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'peteragak61@gmail.com')
    .single();

  if (userError) {
    console.error("❌ Failed to read users table:", userError.message || userError.details || userError);
  } else {
    console.log(`✅ User profile fetched. Role is: ${userData?.role}`);
    if (userData?.role !== 'admin') {
      console.log("⚠️ WARNING: User is NOT an admin. They need to run the UPDATE SQL command.");
    }
  }

  // 2. Check for Infinite Recursion on merchant_requests (42P17)
  const { data: mrData, error: mrError } = await supabase
    .from('merchant_requests')
    .select('*')
    .limit(1);
    
  if (mrError) {
    console.error("❌ Merchant Requests ping failed:", mrError.message || mrError.details || mrError);
    if (mrError.code === '42P17') {
      console.log("⚠️ CONFIRMED: 42P17 Infinite Recursion is still present! The fix_infinite_recursion.sql script was NOT fully executed into Supabase.");
    }
  } else {
    console.log("✅ Merchant Requests ping succeeded. 42P17 infinite recursion is effectively squashed.");
  }

  // 3. Check for Column errors on franchise_groups and search_tuning_rules
  // Since we shouldn't insert fake data, we can just do a very specific SELECT to ensure columns exist!
  const { error: fgError } = await supabase
    .from('franchise_groups')
    .select('id, master_admin, branches, total_sub') // This will crash if columns are missing
    .limit(1);

  if (fgError) {
    if (fgError.code === 'PGRST200') {
      console.error("❌ Franchise Groups schema check failed: Missing columns! The create_missing_tables.sql script was NOT fully executed.");
    } else {
      console.error("❌ Franchise Groups schema check failed:", fgError.message || fgError);
    }
  } else {
    console.log("✅ Franchise Groups schema is healthy. All columns exist.");
  }
  
  const { error: strError } = await supabase
    .from('search_tuning_rules')
    .select('id, term, maps_to, hits')
    .limit(1);
    
  if (strError && strError.code === 'PGRST200') {
    console.error("❌ Search Tuning Rules schema check failed: Missing columns!");
  } else if (strError) {
    console.error("❌ Search Tuning Rules schema check failed:", strError.message || strError);
  } else {
    console.log("✅ Search Tuning Rules schema is healthy. All columns exist.");
  }

  console.log("Diagnostics complete.");
}

runTests();
