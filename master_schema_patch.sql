-- master_schema_patch.sql
-- This actively repairs existing tables by forcing missing columns into them. 
-- It bypasses "IF NOT EXISTS" which previously caused the script to skip tables that were already built but had missing columns.

-- 1. FEATURED PLACEMENTS (Ads)
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS merchant TEXT DEFAULT 'Unknown';
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS slot TEXT DEFAULT 'Banner';
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS start_date TEXT DEFAULT '2026-01-01';
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS end_date TEXT DEFAULT '2026-12-31';
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. PUSH BROADCASTS
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'All';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'Push';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS message TEXT DEFAULT '';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS sent_at TEXT;

-- 3. PROMO CODES
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS discount TEXT DEFAULT '0';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Percentage';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS usage TEXT DEFAULT '0';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- 4. INVOICES
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'Unknown';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS date TEXT DEFAULT '2026-01-01';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 5. SUPPORT TICKETS
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS merchant TEXT DEFAULT 'Unknown';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS issue TEXT DEFAULT '';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Open';
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS date TEXT;

-- 6. FRANCHISE GROUPS
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS master_admin TEXT DEFAULT '';
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS branches TEXT DEFAULT '0';
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS total_sub TEXT DEFAULT 'KES 0';

-- 7. SEARCH TUNING RULES
ALTER TABLE public.search_tuning_rules ADD COLUMN IF NOT EXISTS term TEXT DEFAULT '';
ALTER TABLE public.search_tuning_rules ADD COLUMN IF NOT EXISTS maps_to TEXT DEFAULT '';
ALTER TABLE public.search_tuning_rules ADD COLUMN IF NOT EXISTS hits INTEGER DEFAULT 0;


-- REBOOT THE POSTGREST API CACHE SYSTEM-WIDE
-- This tells the Supabase cloud to delete its stale memory and recognize the new columns immediately!
NOTIFY pgrst, 'reload schema';
