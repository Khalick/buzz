import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://efhdwksunwiawdbkihjy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_kWPMK3c2KiAMF_QfIYA5aQ_eteq1WGC';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrderColumns() {
  console.log("Checking pos_orders...");
  const orderRes = await supabase.from('pos_orders').select('id, subtotal, tax_amount, receipt_number, customer_name, customer_phone, notes, discount_amount, discount_type').limit(1);
  console.log("pos_orders response:", orderRes);

  console.log("Checking pos_products...");
  const prodRes = await supabase.from('pos_products').select('id, cost_price, sku, is_active, category_id').limit(1);
  console.log("pos_products response:", prodRes);
}

checkOrderColumns();
