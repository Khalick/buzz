import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efhdwksunwiawdbkihjy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_kWPMK3c2KiAMF_QfIYA5aQ_eteq1WGC';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'merchant1@test.com',
    password: 'TestPass123!'
  });
  
  if (authError) {
    console.error("Login failed:", authError.message);
    return;
  }
  
  console.log("Logged in as:", authData.user.id);
  
  // Get business id
  const { data: biz } = await supabase.from('businesses').select('id, name').eq('owner_id', authData.user.id).single();
  const businessId = biz?.id;
  console.log("Business ID:", businessId);

  if (!businessId) {
    console.error("No business found");
    return;
  }

  console.log("Testing Category Insert...");
  const catRes = await supabase.from('pos_categories').insert({
    name: 'Electronics Test',
    color: '#ef4444',
    icon: 'tag',
    sort_order: 0,
    business_id: businessId
  }).select();
  console.log("Category Result:", catRes.error ? catRes.error : "Success");

  console.log("Testing Product Insert...");
  const prodRes = await supabase.from('pos_products').insert({
    name: 'Test Speaker Auth',
    price: 1500,
    cost_price: 0,
    stock_quantity: 5,
    barcode: '123456789',
    is_active: true,
    business_id: businessId
  }).select();
  console.log("Product Result:", prodRes.error ? prodRes.error : "Success");

  console.log("Testing Order Insert...");
  const orderRes = await supabase.from('pos_orders').insert({
    business_id: businessId,
    total_amount: 3480,
    subtotal: 3000,
    tax_amount: 480,
    discount_amount: 300,
    discount_type: 'percent',
    payment_method: 'cash',
    customer_name: 'John Doe',
    customer_phone: '0711223344',
    notes: 'Gift wrapped',
    receipt_number: 'RCP-20260517-0001'
  }).select();
  console.log("Order Result:", orderRes.error ? orderRes.error : "Success");
}

runTest();
