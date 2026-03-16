-- Run this in your Supabase SQL Editor to set up tables for Phase 6 features

-- Feature 1: Reverse Market (Smart Leads)
CREATE TABLE IF NOT EXISTS broadcast_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  budget TEXT,
  status TEXT DEFAULT 'open', -- 'open' or 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broadcast_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES broadcast_requests(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  quote_amount TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on RLS for these tables
ALTER TABLE broadcast_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_responses ENABLE ROW LEVEL SECURITY;

-- Note: Depending on your exact security model, you may want to restrict these.
-- For now, allowing all authenticated users to insert/read requests.
CREATE POLICY "Enable read access for all" ON broadcast_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON broadcast_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for owner" ON broadcast_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for all" ON broadcast_responses FOR SELECT USING (true);
CREATE POLICY "Enable insert for businesses" ON broadcast_responses FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Feature 2: Live Pulse (Flash Deals)
-- We will add an is_flash_deal column to the existing deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_flash_deal BOOLEAN DEFAULT false;


-- Feature 3: Local Partnerships
CREATE TABLE IF NOT EXISTS business_partnerships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_a_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  business_b_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE business_partnerships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all" ON business_partnerships FOR SELECT USING (true);
CREATE POLICY "Enable insert for businesses" ON business_partnerships FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for businesses" ON business_partnerships FOR UPDATE USING (auth.role() = 'authenticated');


-- Feature 4: Micro-influencer tracking
-- Add referral_views counter to the proofs (proof_of_visit) table
ALTER TABLE proofs ADD COLUMN IF NOT EXISTS referral_views INTEGER DEFAULT 0;

-- Optional: If you haven't added these to reviews yet (from Phase 3)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ;
