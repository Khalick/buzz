-- fix_infinite_recursion.sql
-- Run this in your Supabase SQL Editor to terminate the infinite recursion loops.

-- 1. Redefine is_admin() in plpgsql so Postgres CANNOT inline it.
-- This ensures the SECURITY DEFINER attribute is strictly honored,
-- bypassing RLS and avoiding infinite recursion with the usr_read policy.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 2. Update merchant_requests policies to use the safely isolated is_admin()
DROP POLICY IF EXISTS "mr_admin_select" ON public.merchant_requests;
DROP POLICY IF EXISTS "mr_admin_update" ON public.merchant_requests;

CREATE POLICY "mr_admin_select" ON public.merchant_requests 
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "mr_admin_update" ON public.merchant_requests 
  FOR UPDATE TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());

-- 3. Also fix the broadcasts policies (we added EXISTS to these earlier)
DROP POLICY IF EXISTS "bc_admin_select" ON public.broadcasts;
DROP POLICY IF EXISTS "bc_admin_insert" ON public.broadcasts;
DROP POLICY IF EXISTS "bc_admin_update" ON public.broadcasts;
DROP POLICY IF EXISTS "bc_admin_delete" ON public.broadcasts;

CREATE POLICY "bc_admin_select" ON public.broadcasts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "bc_admin_insert" ON public.broadcasts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "bc_admin_update" ON public.broadcasts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "bc_admin_delete" ON public.broadcasts FOR DELETE TO authenticated USING (public.is_admin());

-- 4. Fix featured_placements
DROP POLICY IF EXISTS "fp_admin_select" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_insert" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_update" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_delete" ON public.featured_placements;

CREATE POLICY "fp_admin_select" ON public.featured_placements FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "fp_admin_insert" ON public.featured_placements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "fp_admin_update" ON public.featured_placements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "fp_admin_delete" ON public.featured_placements FOR DELETE TO authenticated USING (public.is_admin());

-- 5. Fix franchise_groups
DROP POLICY IF EXISTS "fg_admin_select" ON public.franchise_groups;
DROP POLICY IF EXISTS "fg_admin_insert" ON public.franchise_groups;
DROP POLICY IF EXISTS "fg_admin_update" ON public.franchise_groups;
DROP POLICY IF EXISTS "fg_admin_delete" ON public.franchise_groups;

CREATE POLICY "fg_admin_select" ON public.franchise_groups FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "fg_admin_insert" ON public.franchise_groups FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "fg_admin_update" ON public.franchise_groups FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "fg_admin_delete" ON public.franchise_groups FOR DELETE TO authenticated USING (public.is_admin());

-- 6. Fix search_tuning_rules
DROP POLICY IF EXISTS "str_admin_select" ON public.search_tuning_rules;
DROP POLICY IF EXISTS "str_admin_insert" ON public.search_tuning_rules;
DROP POLICY IF EXISTS "str_admin_update" ON public.search_tuning_rules;
DROP POLICY IF EXISTS "str_admin_delete" ON public.search_tuning_rules;

CREATE POLICY "str_admin_select" ON public.search_tuning_rules FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "str_admin_insert" ON public.search_tuning_rules FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "str_admin_update" ON public.search_tuning_rules FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "str_admin_delete" ON public.search_tuning_rules FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Fix support_tickets
DROP POLICY IF EXISTS "st_admin_select" ON public.support_tickets;
DROP POLICY IF EXISTS "st_admin_insert" ON public.support_tickets;
DROP POLICY IF EXISTS "st_admin_update" ON public.support_tickets;
DROP POLICY IF EXISTS "st_admin_delete" ON public.support_tickets;

CREATE POLICY "st_admin_select" ON public.support_tickets FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "st_admin_insert" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "st_admin_update" ON public.support_tickets FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "st_admin_delete" ON public.support_tickets FOR DELETE TO authenticated USING (public.is_admin());

-- 8. Fix invoices
DROP POLICY IF EXISTS "inv_admin_select" ON public.invoices;
DROP POLICY IF EXISTS "inv_admin_insert" ON public.invoices;
DROP POLICY IF EXISTS "inv_admin_update" ON public.invoices;
DROP POLICY IF EXISTS "inv_admin_delete" ON public.invoices;

CREATE POLICY "inv_admin_select" ON public.invoices FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "inv_admin_insert" ON public.invoices FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "inv_admin_update" ON public.invoices FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "inv_admin_delete" ON public.invoices FOR DELETE TO authenticated USING (public.is_admin());

-- 9. Fix promotions
DROP POLICY IF EXISTS "promo_admin_select" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_insert" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_update" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_delete" ON public.promotions;

CREATE POLICY "promo_admin_select" ON public.promotions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "promo_admin_insert" ON public.promotions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "promo_admin_update" ON public.promotions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "promo_admin_delete" ON public.promotions FOR DELETE TO authenticated USING (public.is_admin());

-- 10. Fix proofs
DROP POLICY IF EXISTS "proofs_admin_select" ON public.proofs;
DROP POLICY IF EXISTS "proofs_admin_manage" ON public.proofs;
DROP POLICY IF EXISTS "proofs_admin_delete" ON public.proofs;
CREATE POLICY "proofs_admin_select" ON public.proofs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "proofs_admin_delete" ON public.proofs FOR DELETE TO authenticated USING (public.is_admin());
