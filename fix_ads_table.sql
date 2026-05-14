-- fix_ads_table.sql
-- The `featured_placements` table already existed in your database before we ran the rebuild script,
-- so the `CREATE TABLE IF NOT EXISTS` block skipped it, causing the 'merchant' column to be physically missing.
-- This forces the column to exist and manually tells the API to reboot its cache.

ALTER TABLE public.featured_placements ADD COLUMN IF NOT EXISTS merchant TEXT DEFAULT 'Unknown';

-- This tells the Supabase API to clear its cache and recognize the new column instantly.
NOTIFY pgrst, 'reload schema';
