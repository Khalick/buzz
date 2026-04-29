-- ================================================================
-- ANALYTICS & DEAL REDEMPTIONS TRACKING
-- Run this in your Supabase SQL Editor.
-- ================================================================

-- 1. Ensure businesses table has a views column
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Create a function to securely increment business views
-- This allows any user (even anonymous) to increment a view without having UPDATE access to the whole row
CREATE OR REPLACE FUNCTION increment_business_views(business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.businesses
  SET views = views + 1
  WHERE id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add redeem_count to deals table if it's missing
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS redeem_count INTEGER DEFAULT 0;

-- 4. Create a function to securely increment deal redemptions
CREATE OR REPLACE FUNCTION increment_deal_redeems(deal_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.deals
  SET redeem_count = redeem_count + 1
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
