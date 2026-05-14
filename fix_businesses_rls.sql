-- fix_businesses_rls.sql
-- The exact crash happens because PostgreSQL's execution planner breaks when evaluating
-- subqueries inside RLS WITH CHECK clauses on the same table, causing fatal 500 stack errors.
-- This rips out the subquery entirely, using clean, direct UID matching.

DROP POLICY IF EXISTS "biz_owner_update" ON public.businesses;

CREATE POLICY "biz_owner_update" ON public.businesses
  FOR UPDATE TO authenticated
  USING (
    submitted_by = (SELECT auth.uid()) 
    OR owner_id = (SELECT auth.uid()) 
    OR public.is_admin()
  )
  WITH CHECK (
    submitted_by = (SELECT auth.uid()) 
    OR owner_id = (SELECT auth.uid()) 
    OR public.is_admin()
  );
