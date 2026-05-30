-- [ignoring loop detection]
-- ================================================================
-- FIX ROW LEVEL SECURITY FOR ALL POS TABLES
-- Allows users associated with a business via either `owner_id`
-- or `submitted_by` to manage POS categories, products, orders,
-- and items.
-- ================================================================

-- 1. POS_CATEGORIES RLS
ALTER TABLE public.pos_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_cat_read" ON public.pos_categories;
DROP POLICY IF EXISTS "pos_cat_owner_write" ON public.pos_categories;
DROP POLICY IF EXISTS "pos_cat_owner_update" ON public.pos_categories;
DROP POLICY IF EXISTS "pos_cat_owner_delete" ON public.pos_categories;

CREATE POLICY "pos_cat_read" ON public.pos_categories FOR SELECT USING (true);
CREATE POLICY "pos_cat_owner_write" ON public.pos_categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));
CREATE POLICY "pos_cat_owner_update" ON public.pos_categories FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));
CREATE POLICY "pos_cat_owner_delete" ON public.pos_categories FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));


-- 2. POS_PRODUCTS RLS
ALTER TABLE public.pos_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_prod_public_read" ON public.pos_products;
DROP POLICY IF EXISTS "pos_prod_owner_insert" ON public.pos_products;
DROP POLICY IF EXISTS "pos_prod_owner_update" ON public.pos_products;
DROP POLICY IF EXISTS "pos_prod_owner_delete" ON public.pos_products;

CREATE POLICY "pos_prod_public_read" ON public.pos_products FOR SELECT USING (true);
CREATE POLICY "pos_prod_owner_insert" ON public.pos_products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));
CREATE POLICY "pos_prod_owner_update" ON public.pos_products FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));
CREATE POLICY "pos_prod_owner_delete" ON public.pos_products FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));


-- 3. POS_ORDERS RLS
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_order_owner_read" ON public.pos_orders;
DROP POLICY IF EXISTS "pos_order_owner_insert" ON public.pos_orders;

CREATE POLICY "pos_order_owner_read" ON public.pos_orders FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));
CREATE POLICY "pos_order_owner_insert" ON public.pos_orders FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));


-- 4. POS_ORDER_ITEMS RLS
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_order_item_owner_read" ON public.pos_order_items;
DROP POLICY IF EXISTS "pos_order_item_owner_insert" ON public.pos_order_items;

CREATE POLICY "pos_order_item_owner_read" ON public.pos_order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pos_orders po
    JOIN public.businesses b ON po.business_id = b.id
    WHERE po.id = pos_order_id AND (b.owner_id = auth.uid() OR b.submitted_by = auth.uid())
  ));
CREATE POLICY "pos_order_item_owner_insert" ON public.pos_order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pos_orders po
    JOIN public.businesses b ON po.business_id = b.id
    WHERE po.id = pos_order_id AND (b.owner_id = auth.uid() OR b.submitted_by = auth.uid())
  ));


-- 5. POS_HELD_ORDERS RLS
ALTER TABLE public.pos_held_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_held_owner_read" ON public.pos_held_orders;
DROP POLICY IF EXISTS "pos_held_owner_write" ON public.pos_held_orders;
DROP POLICY IF EXISTS "pos_held_owner_delete" ON public.pos_held_orders;

CREATE POLICY "pos_held_owner_read" ON public.pos_held_orders FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));
CREATE POLICY "pos_held_owner_write" ON public.pos_held_orders FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));
CREATE POLICY "pos_held_owner_delete" ON public.pos_held_orders FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND (owner_id = auth.uid() OR submitted_by = auth.uid())
  ));

-- Reload schema
NOTIFY pgrst, 'reload schema';
