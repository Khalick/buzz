import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Seeding test product...");
  const { data, error } = await supabase
    .from('pos_products')
    .insert([
      {
        business_id: 'bbbbbbbb-1111-4000-b000-000000000001',
        name: 'Nyama Choma Special',
        price: 850.00,
        stock_quantity: 50,
        barcode: 'NC-123'
      }
    ]);
  if (error) console.error(error);
  else console.log("Product seeded.");
}
run();
