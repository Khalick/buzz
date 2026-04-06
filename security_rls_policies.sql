-- ================================================================
-- BIZHUB SUPABASE RLS POLICIES — FULLY SAFE VERSION
-- Uses information_schema checks before referencing any column.
-- Run this in your Supabase SQL Editor.
-- ================================================================

-- ----------------------------------------------------------------
-- HELPER FUNCTIONS
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth_uid()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT (SELECT auth.uid())
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  )
$$;

-- ================================================================
-- BUSINESSES TABLE
-- ================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "biz_public_read"    ON public.businesses;
DROP POLICY IF EXISTS "biz_auth_read"      ON public.businesses;
DROP POLICY IF EXISTS "biz_user_insert"    ON public.businesses;
DROP POLICY IF EXISTS "biz_owner_update"   ON public.businesses;
DROP POLICY IF EXISTS "biz_admin_delete"   ON public.businesses;

CREATE POLICY "biz_public_read" ON public.businesses
  FOR SELECT USING (approved = true);

CREATE POLICY "biz_auth_read" ON public.businesses
  FOR SELECT TO authenticated
  USING (is_admin() OR approved = true OR submitted_by = auth_uid() OR owner_id = auth_uid());

CREATE POLICY "biz_user_insert" ON public.businesses
  FOR INSERT TO authenticated
  WITH CHECK (auth_uid() IS NOT NULL AND (submitted_by = auth_uid() OR submitted_by IS NULL));

CREATE POLICY "biz_owner_update" ON public.businesses
  FOR UPDATE TO authenticated
  USING (submitted_by = auth_uid() OR owner_id = auth_uid() OR is_admin())
  WITH CHECK (
    approved = (SELECT approved FROM public.businesses WHERE id = businesses.id)
    OR is_admin()
  );

CREATE POLICY "biz_admin_delete" ON public.businesses
  FOR DELETE TO authenticated USING (is_admin());

-- ================================================================
-- REVIEWS TABLE
-- ================================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rev_public_read"   ON public.reviews;
DROP POLICY IF EXISTS "rev_user_insert"   ON public.reviews;
DROP POLICY IF EXISTS "rev_user_update"   ON public.reviews;
DROP POLICY IF EXISTS "rev_owner_respond" ON public.reviews;
DROP POLICY IF EXISTS "rev_user_delete"   ON public.reviews;

CREATE POLICY "rev_public_read" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "rev_user_insert" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth_uid() AND rating >= 1 AND rating <= 5);

CREATE POLICY "rev_user_update" ON public.reviews
  FOR UPDATE TO authenticated
  USING (user_id = auth_uid())
  WITH CHECK (user_id = auth_uid() AND rating >= 1 AND rating <= 5);

CREATE POLICY "rev_owner_respond" ON public.reviews
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = reviews.business_id
      AND (b.submitted_by = auth_uid() OR b.owner_id = auth_uid())
    ) OR is_admin()
  )
  WITH CHECK (user_id = reviews.user_id AND rating = reviews.rating AND comment = reviews.comment);

CREATE POLICY "rev_user_delete" ON public.reviews
  FOR DELETE TO authenticated
  USING (user_id = auth_uid() OR is_admin());

-- ================================================================
-- USERS TABLE
-- ================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usr_read"              ON public.users;
DROP POLICY IF EXISTS "usr_update"            ON public.users;
DROP POLICY IF EXISTS "usr_admin_update_role" ON public.users;

CREATE POLICY "usr_read" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth_uid() OR is_admin());

CREATE POLICY "usr_update" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth_uid())
  WITH CHECK (
    id = auth_uid() AND
    role = (SELECT role FROM public.users WHERE id = auth_uid())
  );

CREATE POLICY "usr_admin_update_role" ON public.users
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ================================================================
-- INVITES TABLE — policies use only inviter_id (always exists).
-- The invitee column policy is applied conditionally based on
-- whether the column is named 'invitee_email' or 'email'.
-- ================================================================
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inv_insert"        ON public.invites;
DROP POLICY IF EXISTS "inv_inviter_read"  ON public.invites;
DROP POLICY IF EXISTS "inv_inviter_update" ON public.invites;
DROP POLICY IF EXISTS "inv_invitee_read"  ON public.invites;
DROP POLICY IF EXISTS "inv_admin_read"    ON public.invites;

-- Inviters can always read and update their own invites
CREATE POLICY "inv_inviter_read" ON public.invites
  FOR SELECT TO authenticated
  USING (inviter_id = auth_uid() OR is_admin());

CREATE POLICY "inv_insert" ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (inviter_id = auth_uid());

CREATE POLICY "inv_inviter_update" ON public.invites
  FOR UPDATE TO authenticated
  USING (inviter_id = auth_uid());

-- Conditionally add invitee read policy based on actual column name
DO $$
DECLARE
  has_invitee_email boolean;
  has_email boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'invitee_email'
  ) INTO has_invitee_email;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'email'
  ) INTO has_email;

  IF has_invitee_email THEN
    EXECUTE $policy$
      CREATE POLICY "inv_invitee_read" ON public.invites
        FOR SELECT TO authenticated
        USING (
          inviter_id = auth_uid() OR
          invitee_email = (SELECT email FROM public.users WHERE id = auth_uid()) OR
          is_admin()
        )
    $policy$;
  ELSIF has_email THEN
    EXECUTE $policy$
      CREATE POLICY "inv_invitee_read" ON public.invites
        FOR SELECT TO authenticated
        USING (
          inviter_id = auth_uid() OR
          email = (SELECT email FROM public.users WHERE id = auth_uid()) OR
          is_admin()
        )
    $policy$;
  END IF;
END $$;

-- ================================================================
-- OPTIONAL TABLES — each wrapped in an existence check
-- ================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reports') THEN
    ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "rep_insert" ON public.reports;
    DROP POLICY IF EXISTS "rep_admin_read" ON public.reports;
    CREATE POLICY "rep_insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "rep_admin_read" ON public.reports FOR SELECT TO authenticated USING (is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_alerts') THEN
    ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "ual_read"   ON public.user_alerts;
    DROP POLICY IF EXISTS "ual_insert" ON public.user_alerts;
    DROP POLICY IF EXISTS "ual_update" ON public.user_alerts;
    DROP POLICY IF EXISTS "ual_delete" ON public.user_alerts;
    CREATE POLICY "ual_read"   ON public.user_alerts FOR SELECT TO authenticated USING (user_id = auth_uid());
    CREATE POLICY "ual_insert" ON public.user_alerts FOR INSERT TO authenticated WITH CHECK (user_id = auth_uid());
    CREATE POLICY "ual_update" ON public.user_alerts FOR UPDATE TO authenticated USING (user_id = auth_uid()) WITH CHECK (user_id = auth_uid());
    CREATE POLICY "ual_delete" ON public.user_alerts FOR DELETE TO authenticated USING (user_id = auth_uid());
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deals') THEN
    ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "deals_public_read"   ON public.deals;
    DROP POLICY IF EXISTS "deals_owner_insert"  ON public.deals;
    DROP POLICY IF EXISTS "deals_owner_modify"  ON public.deals;
    DROP POLICY IF EXISTS "deals_owner_delete"  ON public.deals;
    CREATE POLICY "deals_public_read"  ON public.deals FOR SELECT USING (true);
    CREATE POLICY "deals_owner_insert" ON public.deals FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = deals.business_id AND (b.submitted_by = auth_uid() OR b.owner_id = auth_uid()))
    );
    CREATE POLICY "deals_owner_modify" ON public.deals FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = deals.business_id AND (b.submitted_by = auth_uid() OR b.owner_id = auth_uid())) OR is_admin()
    );
    CREATE POLICY "deals_owner_delete" ON public.deals FOR DELETE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = deals.business_id AND (b.submitted_by = auth_uid() OR b.owner_id = auth_uid())) OR is_admin()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='broadcast_requests') THEN
    ALTER TABLE public.broadcast_requests ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "br_read"   ON public.broadcast_requests;
    DROP POLICY IF EXISTS "br_insert" ON public.broadcast_requests;
    CREATE POLICY "br_read"   ON public.broadcast_requests FOR SELECT TO authenticated USING (user_id = auth_uid() OR is_admin());
    CREATE POLICY "br_insert" ON public.broadcast_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth_uid());
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='business_partnerships') THEN
    ALTER TABLE public.business_partnerships ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "bp_read"   ON public.business_partnerships;
    DROP POLICY IF EXISTS "bp_insert" ON public.business_partnerships;
    CREATE POLICY "bp_read" ON public.business_partnerships FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.businesses b WHERE (b.id = business_a_id OR b.id = business_b_id) AND (b.submitted_by = auth_uid() OR b.owner_id = auth_uid())) OR is_admin()
    );
    CREATE POLICY "bp_insert" ON public.business_partnerships FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_a_id AND (b.submitted_by = auth_uid() OR b.owner_id = auth_uid()))
    );
  END IF;
END $$;

-- ================================================================
-- PERFORMANCE INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_biz_submitted_by ON public.businesses (submitted_by);
CREATE INDEX IF NOT EXISTS idx_biz_owner_id     ON public.businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_biz_approved     ON public.businesses (approved);
CREATE INDEX IF NOT EXISTS idx_rev_business_id  ON public.reviews (business_id);
CREATE INDEX IF NOT EXISTS idx_rev_user_id      ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_inv_inviter_id   ON public.invites (inviter_id);

-- ================================================================
-- AUDIT LOG
-- ================================================================
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action        text NOT NULL,
  resource_type text,
  resource_id   text,
  ip_address    inet,
  user_agent    text,
  metadata      jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_admin_read"     ON public.security_audit_log;
DROP POLICY IF EXISTS "audit_service_insert" ON public.security_audit_log;
CREATE POLICY "audit_admin_read"     ON public.security_audit_log FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "audit_service_insert" ON public.security_audit_log FOR INSERT TO service_role WITH CHECK (true);