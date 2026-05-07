-- ================================================================
-- MASTER SCHEMA MIGRATION: BIZHUB COMPLETE TABLES
-- Run this in your Supabase SQL Editor.
-- This creates ALL missing tables with the exact columns 
-- and data types expected by the frontend and admin portal code.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. CATEGORIES
-- Used by: Main App (/requests/new), Admin Portal
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Categories
INSERT INTO public.categories (name, icon, description) VALUES
  ('Restaurant', '🍽️', 'Restaurants, cafes, and food joints'),
  ('Electronics Repair', '🔧', 'Phone, laptop, and electronics repair'),
  ('Salon & Barber', '💇', 'Hair salons, barbershops, and beauty services'),
  ('Hardware & Construction', '🔨', 'Hardware stores, building supplies, and construction'),
  ('Automotive & Spares', '🚗', 'Car repair, spare parts, and auto services'),
  ('Professional Services', '💼', 'Legal, accounting, and consulting services'),
  ('Groceries & Food', '🛒', 'Supermarkets, green grocers, and food suppliers'),
  ('Health & Pharmacy', '💊', 'Clinics, pharmacies, and health services'),
  ('Education & Tutoring', '📚', 'Schools, tutors, and training centers'),
  ('Plumbing', '🔧', 'Plumbing installation and repair services'),
  ('Cleaning Services', '🧹', 'Home and office cleaning services'),
  ('Photography', '📷', 'Photography and videography services'),
  ('Fashion & Clothing', '👗', 'Tailoring, boutiques, and fashion outlets'),
  ('Transport & Logistics', '🚚', 'Moving, delivery, and transport services'),
  ('Other', '📌', 'Other business categories')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cat_public_read" ON public.categories;
CREATE POLICY "cat_public_read" ON public.categories FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- 2. NOTIFICATIONS
-- Used by: Main App
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_read" ON public.notifications;
DROP POLICY IF EXISTS "notif_insert" ON public.notifications;
DROP POLICY IF EXISTS "notif_update" ON public.notifications;
CREATE POLICY "notif_read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ----------------------------------------------------------------
-- 3. USER_ALERTS
-- Used by: Main App (/api/alerts)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  frequency TEXT DEFAULT 'daily',
  active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ual_read" ON public.user_alerts;
DROP POLICY IF EXISTS "ual_insert" ON public.user_alerts;
DROP POLICY IF EXISTS "ual_update" ON public.user_alerts;
DROP POLICY IF EXISTS "ual_delete" ON public.user_alerts;
CREATE POLICY "ual_read" ON public.user_alerts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ual_insert" ON public.user_alerts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ual_update" ON public.user_alerts FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ual_delete" ON public.user_alerts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ----------------------------------------------------------------
-- 4. FIELD_AGENTS
-- Used by: Admin Portal (/agents)
-- UI expects: id, name, zone, verifications, active, lastSeen, last_seen_at
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.field_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  verifications INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  lastSeen TEXT, 
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.field_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fa_admin_read" ON public.field_agents;
CREATE POLICY "fa_admin_read" ON public.field_agents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 5. FEATURED_PLACEMENTS
-- Used by: Admin Portal (/ads)
-- UI expects: id, merchant, slot, status, start_date, end_date, views, clicks, image_url
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.featured_placements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant TEXT NOT NULL, -- The UI passes a string merchantId here
  slot TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('active', 'scheduled', 'expired')),
  start_date TEXT NOT NULL, -- UI passes YYYY-MM-DD string
  end_date TEXT NOT NULL,   -- UI passes YYYY-MM-DD string
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.featured_placements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fp_public_read" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_manage" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_select" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_insert" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_update" ON public.featured_placements;
DROP POLICY IF EXISTS "fp_admin_delete" ON public.featured_placements;
CREATE POLICY "fp_public_read" ON public.featured_placements FOR SELECT USING (true);
CREATE POLICY "fp_admin_insert" ON public.featured_placements FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "fp_admin_update" ON public.featured_placements FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "fp_admin_delete" ON public.featured_placements FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 6. PROMOTIONS
-- Used by: Admin Portal (/promotions)
-- UI expects: id, code, discount, type, usage, status
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount TEXT NOT NULL,
  type TEXT DEFAULT 'Percentage',
  usage TEXT DEFAULT '100',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promo_public_read" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_manage" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_select" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_insert" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_update" ON public.promotions;
DROP POLICY IF EXISTS "promo_admin_delete" ON public.promotions;
CREATE POLICY "promo_public_read" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "promo_admin_insert" ON public.promotions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "promo_admin_update" ON public.promotions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "promo_admin_delete" ON public.promotions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 7. BROADCASTS (Admin Broadcast Engine)
-- Used by: Admin Portal (/broadcasts)
-- UI expects: id, title, message, target, channel, status, reach, sentAt
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT DEFAULT 'all',
  channel TEXT DEFAULT 'sms',
  status TEXT DEFAULT 'Delivered',
  reach INTEGER DEFAULT 0,
  sentAt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bc_admin_manage" ON public.broadcasts;
DROP POLICY IF EXISTS "bc_admin_select" ON public.broadcasts;
DROP POLICY IF EXISTS "bc_admin_insert" ON public.broadcasts;
DROP POLICY IF EXISTS "bc_admin_update" ON public.broadcasts;
DROP POLICY IF EXISTS "bc_admin_delete" ON public.broadcasts;
CREATE POLICY "bc_admin_select" ON public.broadcasts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "bc_admin_insert" ON public.broadcasts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "bc_admin_update" ON public.broadcasts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "bc_admin_delete" ON public.broadcasts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 8. INVOICES
-- Used by: Admin Portal (/invoices)
-- UI expects: id, company, amount, date(string), status
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inv_admin_manage" ON public.invoices;
DROP POLICY IF EXISTS "inv_admin_select" ON public.invoices;
DROP POLICY IF EXISTS "inv_admin_insert" ON public.invoices;
DROP POLICY IF EXISTS "inv_admin_update" ON public.invoices;
DROP POLICY IF EXISTS "inv_admin_delete" ON public.invoices;
CREATE POLICY "inv_admin_select" ON public.invoices FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "inv_admin_insert" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "inv_admin_update" ON public.invoices FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "inv_admin_delete" ON public.invoices FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 9. SUPPORT_TICKETS
-- Used by: Admin Portal (/support)
-- UI expects: id, merchant, issue, priority, status, date
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant TEXT NOT NULL,
  issue TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal',
  status TEXT DEFAULT 'Open',
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "st_admin_manage" ON public.support_tickets;
DROP POLICY IF EXISTS "st_admin_select" ON public.support_tickets;
DROP POLICY IF EXISTS "st_admin_insert" ON public.support_tickets;
DROP POLICY IF EXISTS "st_admin_update" ON public.support_tickets;
DROP POLICY IF EXISTS "st_admin_delete" ON public.support_tickets;
CREATE POLICY "st_admin_select" ON public.support_tickets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "st_admin_insert" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "st_admin_update" ON public.support_tickets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "st_admin_delete" ON public.support_tickets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 10. MPESA_LEDGER 
-- Used by: Admin Portal (/payments, /reports)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mpesa_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE,
  merchant_name TEXT,
  amount NUMERIC NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  type TEXT DEFAULT 'payment',
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mpesa_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mpesa_admin_read" ON public.mpesa_ledger;
CREATE POLICY "mpesa_admin_read" ON public.mpesa_ledger FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 11. FRANCHISE_GROUPS
-- Used by: Admin Portal (/enterprise)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.franchise_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill columns the admin portal frontend expects
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS master_admin TEXT;
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS branches INTEGER DEFAULT 0;
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS total_sub TEXT DEFAULT 'KES 0';

ALTER TABLE public.franchise_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fg_admin_read" ON public.franchise_groups;
DROP POLICY IF EXISTS "fg_admin_select" ON public.franchise_groups;
DROP POLICY IF EXISTS "fg_admin_insert" ON public.franchise_groups;
DROP POLICY IF EXISTS "fg_admin_update" ON public.franchise_groups;
DROP POLICY IF EXISTS "fg_admin_delete" ON public.franchise_groups;
CREATE POLICY "fg_admin_select" ON public.franchise_groups FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "fg_admin_insert" ON public.franchise_groups FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "fg_admin_update" ON public.franchise_groups FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "fg_admin_delete" ON public.franchise_groups FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 12. SEARCH_TUNING_RULES
-- Used by: Admin Portal (/search-metrics)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.search_tuning_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_pattern TEXT NOT NULL,
  boost_category TEXT,
  weight NUMERIC DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill columns the admin portal frontend expects
ALTER TABLE public.search_tuning_rules ADD COLUMN IF NOT EXISTS term TEXT;
ALTER TABLE public.search_tuning_rules ADD COLUMN IF NOT EXISTS maps_to TEXT;
ALTER TABLE public.search_tuning_rules ADD COLUMN IF NOT EXISTS hits INTEGER DEFAULT 0;

ALTER TABLE public.search_tuning_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "str_admin_manage" ON public.search_tuning_rules;
DROP POLICY IF EXISTS "str_admin_select" ON public.search_tuning_rules;
DROP POLICY IF EXISTS "str_admin_insert" ON public.search_tuning_rules;
DROP POLICY IF EXISTS "str_admin_update" ON public.search_tuning_rules;
DROP POLICY IF EXISTS "str_admin_delete" ON public.search_tuning_rules;
CREATE POLICY "str_admin_select" ON public.search_tuning_rules FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "str_admin_insert" ON public.search_tuning_rules FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "str_admin_update" ON public.search_tuning_rules FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "str_admin_delete" ON public.search_tuning_rules FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 13. AUDIT_LOGS
-- Used by: Admin Portal (Dashboard)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_admin_read" ON public.audit_logs;
CREATE POLICY "audit_admin_read" ON public.audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 14. FIX: businesses table — add user_id alias column
-- The admin portal's "Add Merchant" form writes to user_id instead of owner_id
-- ----------------------------------------------------------------
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------
-- STORAGE BUCKET GENERATION
-- The admin portal (/ads) uploads to 'bizhub_assets' bucket.
-- Ensure the bucket exists and is public.
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bizhub_assets', 'bizhub_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for bizhub_assets
DROP POLICY IF EXISTS "bizhub_assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "bizhub_assets_admin_insert" ON storage.objects;
CREATE POLICY "bizhub_assets_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'bizhub_assets');
CREATE POLICY "bizhub_assets_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bizhub_assets' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 15. DEALS
-- Used by: Main App (/deals, /dashboard/deals), Admin Portal (/moderation)
-- UI expects: id, title, description, business_name, business_id,
--             expiry_date, is_flash_deal, redeem_count, created_at
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  expiry_date TIMESTAMPTZ,
  is_flash_deal BOOLEAN DEFAULT false,
  redeem_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deals_public_read" ON public.deals;
DROP POLICY IF EXISTS "deals_owner_insert" ON public.deals;
DROP POLICY IF EXISTS "deals_owner_delete" ON public.deals;
DROP POLICY IF EXISTS "deals_admin_manage" ON public.deals;
CREATE POLICY "deals_public_read" ON public.deals FOR SELECT USING (true);
CREATE POLICY "deals_owner_insert" ON public.deals FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "deals_owner_delete" ON public.deals FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "deals_admin_manage" ON public.deals FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- RPC function used by /deals page to count redeems
CREATE OR REPLACE FUNCTION public.increment_deal_redeems(deal_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.deals SET redeem_count = COALESCE(redeem_count, 0) + 1 WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- 16. EVENTS
-- Used by: Main App (/events)
-- UI expects: id, title, description, business_id, business_name,
--             location, event_date, start_time, end_time, image_url,
--             attendees, is_paid, price, created_at
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  image_url TEXT,
  attendees INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_public_read" ON public.events;
DROP POLICY IF EXISTS "events_owner_insert" ON public.events;
DROP POLICY IF EXISTS "events_admin_manage" ON public.events;
CREATE POLICY "events_public_read" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_owner_insert" ON public.events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "events_admin_manage" ON public.events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ----------------------------------------------------------------
-- 17. REVIEWS
-- Used by: Main App (/api/reviews, /dashboard/reviews, /business/[id])
-- UI expects: id, business_id, user_id, rating, comment, created_at
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
DROP POLICY IF EXISTS "reviews_auth_insert" ON public.reviews;
DROP POLICY IF EXISTS "reviews_owner_delete" ON public.reviews;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_auth_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_owner_delete" ON public.reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ----------------------------------------------------------------
-- 18. INVITES
-- Used by: Main App (/api/invites, /invite/[code])
-- UI expects: id, inviter_id, inviter_email, inviter_name,
--             invitee_email, type, business_name, message,
--             code, status, expires_at, created_at
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_email TEXT,
  inviter_name TEXT,
  invitee_email TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'user',
  business_name TEXT,
  message TEXT DEFAULT '',
  code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill columns if invites table already existed with a different schema
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS inviter_email TEXT;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS inviter_name TEXT;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS invitee_email TEXT;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'user';
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS message TEXT DEFAULT '';
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invites_owner_read" ON public.invites;
DROP POLICY IF EXISTS "invites_auth_insert" ON public.invites;
DROP POLICY IF EXISTS "invites_code_read" ON public.invites;
CREATE POLICY "invites_owner_read" ON public.invites FOR SELECT TO authenticated
  USING (inviter_id = auth.uid() OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "invites_auth_insert" ON public.invites FOR INSERT TO authenticated WITH CHECK (inviter_id = auth.uid());
CREATE POLICY "invites_code_read" ON public.invites FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- 19. PROOFS (Proof of Visit)
-- Used by: Main App (/proof-of-visit, /profile, /admin, /dashboard/promoters)
-- UI expects: id, name, business_name, image_url, approved,
--             submitted_by, referral_views, created_at
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "proofs_public_read" ON public.proofs;
DROP POLICY IF EXISTS "proofs_auth_insert" ON public.proofs;
DROP POLICY IF EXISTS "proofs_self_update" ON public.proofs;
DROP POLICY IF EXISTS "proofs_admin_manage" ON public.proofs;
CREATE POLICY "proofs_public_read" ON public.proofs FOR SELECT USING (approved = true);
CREATE POLICY "proofs_auth_insert" ON public.proofs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "proofs_self_update" ON public.proofs FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (submitted_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "proofs_admin_select" ON public.proofs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "proofs_admin_delete" ON public.proofs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Storage bucket for proof-of-visit photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "proofs_public_read_storage" ON storage.objects;
DROP POLICY IF EXISTS "proofs_auth_insert_storage" ON storage.objects;
CREATE POLICY "proofs_public_read_storage" ON storage.objects FOR SELECT USING (bucket_id = 'proofs');
CREATE POLICY "proofs_auth_insert_storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'proofs');

-- ================================================================
-- DONE! All missing tables, columns, storage buckets, and
-- functions created. Run this in your Supabase SQL Editor.
-- ================================================================

-- ================================================================
-- 20. MERCHANT_REQUESTS — RLS Policies
-- This table was created by supabase_merchant_upgrade.sql but
-- has NO RLS policies, causing all operations to be blocked.
-- ================================================================
ALTER TABLE IF EXISTS public.merchant_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mr_user_read" ON public.merchant_requests;
DROP POLICY IF EXISTS "mr_user_insert" ON public.merchant_requests;
DROP POLICY IF EXISTS "mr_admin_select" ON public.merchant_requests;
DROP POLICY IF EXISTS "mr_admin_update" ON public.merchant_requests;
CREATE POLICY "mr_user_read" ON public.merchant_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "mr_user_insert" ON public.merchant_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "mr_admin_select" ON public.merchant_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "mr_admin_update" ON public.merchant_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ================================================================
-- 21. BUSINESSES — add is_verified column for verification queue
-- ================================================================
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
