import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efhdwksunwiawdbkihjy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_kWPMK3c2KiAMF_QfIYA5aQ_eteq1WGC';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("Testing auth...");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    // We need a dummy merchant auth to test RLS, but let's see if we can get a public business id
    console.log("No auth, RLS might fail, but let's test schema validation.");
  }

  // Get any business
  const { data: businesses } = await supabase.from('businesses').select('id').limit(1);
  const businessId = businesses?.[0]?.id || '11111111-1111-1111-1111-111111111111';

  console.log("Testing Category Insert...");
  const catRes = await supabase.from('pos_categories').insert({
    name: 'Electronics',
    color: '#ef4444',
    icon: 'tag',
    sort_order: 0,
    business_id: businessId
  }).select();
  console.log("Category Result:", catRes.error ? catRes.error : "Success");

  console.log("Testing Product Insert...");
  const prodRes = await supabase.from('pos_products').insert({
    name: 'Test Speaker',
    price: 1500,
    cost_price: 0,
    stock_quantity: 5,
    barcode: '123456789',
    sku: undefined,
    category_id: undefined,
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
