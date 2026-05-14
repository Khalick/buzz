-- ================================================================
-- FREE POS MODULE — SCHEMA V2 EXPANSION
-- Adds categories, receipts, discounts, customer capture,
-- held orders, SKU, cost price, and more.
-- Run AFTER bizhub_pos_schema_patch.sql
-- ================================================================

-- ----------------------------------------------------------------
-- 1. POS_CATEGORIES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'tag',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pos_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_cat_read" ON public.pos_categories;
DROP POLICY IF EXISTS "pos_cat_owner_write" ON public.pos_categories;
DROP POLICY IF EXISTS "pos_cat_owner_update" ON public.pos_categories;
DROP POLICY IF EXISTS "pos_cat_owner_delete" ON public.pos_categories;

CREATE POLICY "pos_cat_read" ON public.pos_categories FOR SELECT USING (true);
CREATE POLICY "pos_cat_owner_write" ON public.pos_categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "pos_cat_owner_update" ON public.pos_categories FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "pos_cat_owner_delete" ON public.pos_categories FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- ----------------------------------------------------------------
-- 2. POS_HELD_ORDERS (parked transactions)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_held_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Held Order',
  items JSONB NOT NULL DEFAULT '[]',
  customer_name TEXT,
  customer_phone TEXT,
  discount_amount NUMERIC DEFAULT 0,
  discount_type TEXT DEFAULT 'none',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pos_held_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_held_owner_read" ON public.pos_held_orders;
DROP POLICY IF EXISTS "pos_held_owner_write" ON public.pos_held_orders;
DROP POLICY IF EXISTS "pos_held_owner_delete" ON public.pos_held_orders;

CREATE POLICY "pos_held_owner_read" ON public.pos_held_orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "pos_held_owner_write" ON public.pos_held_orders FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "pos_held_owner_delete" ON public.pos_held_orders FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));

-- ----------------------------------------------------------------
-- 3. EXTEND pos_products (add category, sku, cost_price, is_active)
-- ----------------------------------------------------------------
ALTER TABLE public.pos_products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.pos_categories(id) ON DELETE SET NULL;
ALTER TABLE public.pos_products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.pos_products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.pos_products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ----------------------------------------------------------------
-- 4. EXTEND pos_orders (receipt, discount, customer, notes, subtotal, tax)
-- ----------------------------------------------------------------
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'none';
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE public.pos_orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;

-- ----------------------------------------------------------------
-- 5. Receipt number auto-generation function
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_catalog
AS $$
DECLARE
  day_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO day_count
  FROM public.pos_orders
  WHERE business_id = NEW.business_id
    AND DATE(created_at) = CURRENT_DATE;
  
  NEW.receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(day_count::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_receipt_number ON public.pos_orders;
CREATE TRIGGER trg_receipt_number
  BEFORE INSERT ON public.pos_orders
  FOR EACH ROW
  WHEN (NEW.receipt_number IS NULL)
  EXECUTE FUNCTION public.generate_receipt_number();

-- Reboot API cache
NOTIFY pgrst, 'reload schema';
