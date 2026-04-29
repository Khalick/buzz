-- ================================================================
-- VERIFICATION REQUESTS — Merchant "Blue Checkmark" Badge System
-- Run this in your Supabase SQL Editor.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('business_license', 'kra_pin', 'national_id', 'other')),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ
);

-- Turn on Row Level Security
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own verification requests
CREATE POLICY "Users can insert own verification requests"
  ON public.verification_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests"
  ON public.verification_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
  ON public.verification_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update verification requests (approve/reject)
CREATE POLICY "Admins can update verification requests"
  ON public.verification_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add verified column to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Performance index
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests (status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON public.verification_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_business ON public.verification_requests (business_id);
