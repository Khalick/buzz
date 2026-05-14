-- ================================================================
-- FREE POS MODULE — DATABASE SCHEMA PATCH
-- Adds dedicated tables for POS products, orders, and items.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. POS_PRODUCTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER DEFAULT 0,
  barcode TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pos_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_prod_public_read" ON public.pos_products;
DROP POLICY IF EXISTS "pos_prod_owner_insert" ON public.pos_products;
DROP POLICY IF EXISTS "pos_prod_owner_update" ON public.pos_products;
DROP POLICY IF EXISTS "pos_prod_owner_delete" ON public.pos_products;

CREATE POLICY "pos_prod_public_read" ON public.pos_products FOR SELECT USING (true);
CREATE POLICY "pos_prod_owner_insert" ON public.pos_products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "pos_prod_owner_update" ON public.pos_products FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "pos_prod_owner_delete" ON public.pos_products FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- ----------------------------------------------------------------
-- 2. POS_ORDERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'mobile_money')),
  status TEXT DEFAULT 'completed',
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_order_owner_read" ON public.pos_orders;
DROP POLICY IF EXISTS "pos_order_owner_insert" ON public.pos_orders;

CREATE POLICY "pos_order_owner_read" ON public.pos_orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "pos_order_owner_insert" ON public.pos_orders FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- ----------------------------------------------------------------
-- 3. POS_ORDER_ITEMS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pos_order_id UUID REFERENCES public.pos_orders(id) ON DELETE CASCADE,
  pos_product_id UUID REFERENCES public.pos_products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_order_item_owner_read" ON public.pos_order_items;
DROP POLICY IF EXISTS "pos_order_item_owner_insert" ON public.pos_order_items;

CREATE POLICY "pos_order_item_owner_read" ON public.pos_order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pos_orders po
    JOIN public.businesses b ON po.business_id = b.id
    WHERE po.id = pos_order_id AND b.owner_id = auth.uid()
  ));

CREATE POLICY "pos_order_item_owner_insert" ON public.pos_order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pos_orders po
    JOIN public.businesses b ON po.business_id = b.id
    WHERE po.id = pos_order_id AND b.owner_id = auth.uid()
  ));
