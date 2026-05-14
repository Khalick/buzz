-- final_broadcast_patch.sql
-- This actively repairs the remaining missing columns inside the exact tables that 
-- failed after analyzing the exact Typescript payload properties.

-- 1. PUSH BROADCASTS (adding missing columns from payload: title, target, reach)
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Broadcast';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS target TEXT DEFAULT 'All Users';
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS reach INTEGER DEFAULT 0;

-- 2. FRANCHISE GROUPS (adding missing column from payload: name)
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Group';

-- REBOOT THE POSTGREST API CACHE SYSTEM-WIDE
NOTIFY pgrst, 'reload schema';
