-- ================================================================
-- FIX: Smart Broadcast RLS Policies
-- Run this in your Supabase SQL Editor.
-- 
-- Problem: security_rls_policies.sql made broadcast_requests readable
-- only by the request owner + admins. Merchants can't see leads.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. BROADCAST_REQUESTS — Fix SELECT policy
-- Allow authenticated users to see OPEN requests (for merchant leads),
-- while owners & admins can see all their own (including closed).
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "br_read" ON public.broadcast_requests;
DROP POLICY IF EXISTS "Enable read access for all" ON public.broadcast_requests;

CREATE POLICY "br_read" ON public.broadcast_requests
  FOR SELECT TO authenticated
  USING (
    status = 'open'              -- Any authenticated user can see open requests (merchant leads)
    OR user_id = auth.uid()      -- Owners always see their own
    OR is_admin()                -- Admins see everything
  );

-- Keep the existing INSERT policy (user can only insert as themselves)
-- This should already exist, but ensure it's correct:
DROP POLICY IF EXISTS "br_insert" ON public.broadcast_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.broadcast_requests;

CREATE POLICY "br_insert" ON public.broadcast_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Keep the existing UPDATE policy (owner can update their own)
DROP POLICY IF EXISTS "br_update" ON public.broadcast_requests;
DROP POLICY IF EXISTS "Enable update for owner" ON public.broadcast_requests;

CREATE POLICY "br_update" ON public.broadcast_requests
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- ----------------------------------------------------------------
-- 2. BROADCAST_RESPONSES — Ensure merchants can insert quotes
--    and both request owners & responding merchants can read them
-- ----------------------------------------------------------------
ALTER TABLE public.broadcast_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bres_read" ON public.broadcast_responses;
DROP POLICY IF EXISTS "Enable read access for all" ON public.broadcast_responses;

CREATE POLICY "bres_read" ON public.broadcast_responses
  FOR SELECT TO authenticated
  USING (
    -- The customer who created the original request can see responses
    EXISTS (
      SELECT 1 FROM public.broadcast_requests br
      WHERE br.id = broadcast_responses.request_id
      AND br.user_id = auth.uid()
    )
    -- The merchant who submitted the response can see it
    OR business_id IN (
      SELECT b.id FROM public.businesses b
      WHERE b.owner_id = auth.uid() OR b.submitted_by = auth.uid()
    )
    -- Admins see all
    OR is_admin()
  );

DROP POLICY IF EXISTS "bres_insert" ON public.broadcast_responses;
DROP POLICY IF EXISTS "Enable insert for businesses" ON public.broadcast_responses;

CREATE POLICY "bres_insert" ON public.broadcast_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Only business owners/submitters can respond on behalf of their business
    business_id IN (
      SELECT b.id FROM public.businesses b
      WHERE b.owner_id = auth.uid() OR b.submitted_by = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 3. Helpful indexes for the new policies
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_br_status ON public.broadcast_requests (status);
CREATE INDEX IF NOT EXISTS idx_br_user_id ON public.broadcast_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_bres_request_id ON public.broadcast_responses (request_id);
CREATE INDEX IF NOT EXISTS idx_bres_business_id ON public.broadcast_responses (business_id);
