-- ================================================================
-- BIZHUB FIX TESTER BUSINESS
-- This script associates your test account with a business so the POS works.
-- ================================================================

-- Replace 'tester@example.com' with your actual logged-in test email if different
UPDATE public.businesses 
SET owner_id = (SELECT id FROM auth.users WHERE email = 'tester@example.com' LIMIT 1),
    approved = true
WHERE id = (SELECT id FROM public.businesses LIMIT 1);
