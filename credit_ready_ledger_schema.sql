-- ================================================================
-- CREDIT-READY LEDGER SCHEMA
-- Stores computed financial health score snapshots for businesses.
-- Run this in your Supabase SQL Editor.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. CREDIT_HEALTH_SCORES
-- Used by: Main App (/dashboard/credit-health)
-- Stores the latest computed financial health score for each business.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_health_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 900),
  tier TEXT NOT NULL DEFAULT 'starting',
  mode TEXT NOT NULL DEFAULT 'self_declared' CHECK (mode IN ('pos_verified', 'self_declared')),

  -- Pillar breakdown (0-100 each)
  pillar_volume NUMERIC DEFAULT 0,
  pillar_consistency NUMERIC DEFAULT 0,
  pillar_maturity NUMERIC DEFAULT 0,
  pillar_diversity NUMERIC DEFAULT 0,

  -- Snapshot data
  total_revenue_30d NUMERIC DEFAULT 0,
  total_transactions_30d INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0,
  unique_products_sold INTEGER DEFAULT 0,
  avg_daily_revenue NUMERIC DEFAULT 0,

  -- Self-declared data (for non-POS businesses)
  self_declared_weekly_revenue NUMERIC DEFAULT 0,
  self_declared_avg_transaction NUMERIC DEFAULT 0,
  self_declared_years_in_business NUMERIC DEFAULT 0,
  self_declared_entries JSONB DEFAULT '[]',

  -- Sharing / consent
  sharing_enabled BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  shared_with JSONB DEFAULT '[]',

  computed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.credit_health_scores ENABLE ROW LEVEL SECURITY;

-- Owner can read/update their own score
DROP POLICY IF EXISTS "chs_owner_read" ON public.credit_health_scores;
CREATE POLICY "chs_owner_read" ON public.credit_health_scores FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = credit_health_scores.business_id
    AND (businesses.owner_id = auth.uid() OR businesses.submitted_by = auth.uid())
  ));

DROP POLICY IF EXISTS "chs_owner_insert" ON public.credit_health_scores;
CREATE POLICY "chs_owner_insert" ON public.credit_health_scores FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = credit_health_scores.business_id
    AND (businesses.owner_id = auth.uid() OR businesses.submitted_by = auth.uid())
  ));

DROP POLICY IF EXISTS "chs_owner_update" ON public.credit_health_scores;
CREATE POLICY "chs_owner_update" ON public.credit_health_scores FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id = credit_health_scores.business_id
    AND (businesses.owner_id = auth.uid() OR businesses.submitted_by = auth.uid())
  ));

-- Public access via share token (handled by API route, not RLS)
-- Admin can read all scores
DROP POLICY IF EXISTS "chs_admin_read" ON public.credit_health_scores;
CREATE POLICY "chs_admin_read" ON public.credit_health_scores FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ================================================================
-- DONE! Credit health scores table created.
-- ================================================================
