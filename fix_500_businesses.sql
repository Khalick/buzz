-- fix_500_businesses.sql
-- Resolves the 500 internal server error triggered during merchant approvals.
-- The previous policy lacked an alias, causing `id = businesses.id` to evaluate as `id = id` (true for all rows),
-- crashing PostgreSQL when the subquery unexpectedly returned the entire table instead of 1 row.

DROP POLICY IF EXISTS "biz_owner_update" ON public.businesses;

CREATE POLICY "biz_owner_update" ON public.businesses
  FOR UPDATE TO authenticated
  USING (
    submitted_by = (SELECT auth.uid()) 
    OR owner_id = (SELECT auth.uid()) 
    OR is_admin()
  )
  WITH CHECK (
    approved = (SELECT b.approved FROM public.businesses b WHERE b.id = businesses.id)
    OR is_admin()
  );
