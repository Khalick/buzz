-- ================================================================
-- TEST MERCHANT SEED DATA
-- Run this in Supabase SQL Editor AFTER running fix_broadcast_rls.sql
--
-- Creates 3 test merchant accounts + their businesses so you can
-- test the full broadcast flow from both customer and merchant sides.
--
-- Test Accounts (password for all: TestPass123!)
--   1. merchant1@test.com  — Mama Njeri's Kitchen (Restaurant)
--   2. merchant2@test.com  — TechFix Thika (Electronics Repair)
--   3. merchant3@test.com  — Glamour Salon Thika (Salon & Barber)
--
-- You can also use your own account as a customer to broadcast.
-- ================================================================

-- Step 1: Create test auth users
-- (Using Supabase's built-in function to create confirmed users)

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token
)
VALUES
  (
    'aaaaaaaa-1111-4000-a000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'merchant1@test.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Mama Njeri"}',
    NOW(), NOW(), '', ''
  ),
  (
    'aaaaaaaa-2222-4000-a000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'merchant2@test.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"James Kamau"}',
    NOW(), NOW(), '', ''
  ),
  (
    'aaaaaaaa-3333-4000-a000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'merchant3@test.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Grace Wanjiku"}',
    NOW(), NOW(), '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- Create identities for email login
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  (
    'aaaaaaaa-1111-4000-a000-000000000001',
    'aaaaaaaa-1111-4000-a000-000000000001',
    'merchant1@test.com', 'email',
    '{"sub":"aaaaaaaa-1111-4000-a000-000000000001","email":"merchant1@test.com"}',
    NOW(), NOW(), NOW()
  ),
  (
    'aaaaaaaa-2222-4000-a000-000000000002',
    'aaaaaaaa-2222-4000-a000-000000000002',
    'merchant2@test.com', 'email',
    '{"sub":"aaaaaaaa-2222-4000-a000-000000000002","email":"merchant2@test.com"}',
    NOW(), NOW(), NOW()
  ),
  (
    'aaaaaaaa-3333-4000-a000-000000000003',
    'aaaaaaaa-3333-4000-a000-000000000003',
    'merchant3@test.com', 'email',
    '{"sub":"aaaaaaaa-3333-4000-a000-000000000003","email":"merchant3@test.com"}',
    NOW(), NOW(), NOW()
  )
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Step 2: Create public.users profiles
INSERT INTO public.users (id, email, display_name, role, phone, location, bio, favorites, created_at, updated_at)
VALUES
  (
    'aaaaaaaa-1111-4000-a000-000000000001',
    'merchant1@test.com',
    'Mama Njeri',
    'user',
    '+254712000001',
    'Thika',
    'Running the best kitchen in Thika town since 2015',
    '{}',
    NOW(), NOW()
  ),
  (
    'aaaaaaaa-2222-4000-a000-000000000002',
    'merchant2@test.com',
    'James Kamau',
    'user',
    '+254712000002',
    'Thika',
    'Professional electronics repair — phones, laptops, TVs',
    '{}',
    NOW(), NOW()
  ),
  (
    'aaaaaaaa-3333-4000-a000-000000000003',
    'merchant3@test.com',
    'Grace Wanjiku',
    'user',
    '+254712000003',
    'Thika',
    'Beauty and grooming expert with 8 years experience',
    '{}',
    NOW(), NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio;

-- Step 3: Create test businesses (approved, linked to merchants)
INSERT INTO public.businesses (
  id, name, description, category, approved, rating, review_count, views,
  is_premium, images, owner_id, submitted_by,
  location, contact, business_hours, created_at, updated_at
)
VALUES
  (
    'bbbbbbbb-1111-4000-b000-000000000001',
    'Mama Njeri''s Kitchen',
    'Authentic Kenyan cuisine — nyama choma, ugali, pilau, and fresh juices. Catering for events and daily meals. Best chapati in Thika!',
    'Restaurant',
    true,
    4.6,
    23,
    450,
    false,
    '{}',
    'aaaaaaaa-1111-4000-a000-000000000001',
    'aaaaaaaa-1111-4000-a000-000000000001',
    '{"county":"Kiambu","town":"Thika","address":"Kenyatta Highway, near Stadium"}',
    '{"phone":"+254712000001","whatsapp":"+254712000001","email":"mamanjeri@test.com"}',
    '{"monday":{"open":"07:00","close":"21:00","closed":false},"tuesday":{"open":"07:00","close":"21:00","closed":false},"wednesday":{"open":"07:00","close":"21:00","closed":false},"thursday":{"open":"07:00","close":"21:00","closed":false},"friday":{"open":"07:00","close":"22:00","closed":false},"saturday":{"open":"08:00","close":"22:00","closed":false},"sunday":{"open":"09:00","close":"20:00","closed":false}}',
    NOW(), NOW()
  ),
  (
    'bbbbbbbb-2222-4000-b000-000000000002',
    'TechFix Thika',
    'Professional repair for phones, laptops, tablets, and TVs. Screen replacement, software, data recovery. Quick turnaround, fair prices.',
    'Electronics Repair',
    true,
    4.3,
    15,
    320,
    false,
    '{}',
    'aaaaaaaa-2222-4000-a000-000000000002',
    'aaaaaaaa-2222-4000-a000-000000000002',
    '{"county":"Kiambu","town":"Thika","address":"Makongeni Mall, 2nd Floor"}',
    '{"phone":"+254712000002","whatsapp":"+254712000002","email":"techfix@test.com"}',
    '{"monday":{"open":"08:00","close":"18:00","closed":false},"tuesday":{"open":"08:00","close":"18:00","closed":false},"wednesday":{"open":"08:00","close":"18:00","closed":false},"thursday":{"open":"08:00","close":"18:00","closed":false},"friday":{"open":"08:00","close":"18:00","closed":false},"saturday":{"open":"09:00","close":"16:00","closed":false},"sunday":{"open":"00:00","close":"00:00","closed":true}}',
    NOW(), NOW()
  ),
  (
    'bbbbbbbb-3333-4000-b000-000000000003',
    'Glamour Salon Thika',
    'Full-service beauty salon — hair styling, braiding, nails, facials, and barbering. Bridal packages available. Walk-ins welcome.',
    'Salon & Barber',
    true,
    4.8,
    31,
    680,
    true,
    '{}',
    'aaaaaaaa-3333-4000-a000-000000000003',
    'aaaaaaaa-3333-4000-a000-000000000003',
    '{"county":"Kiambu","town":"Thika","address":"Uhuru Street, next to KCB Bank"}',
    '{"phone":"+254712000003","whatsapp":"+254712000003","email":"glamour@test.com"}',
    '{"monday":{"open":"08:00","close":"19:00","closed":false},"tuesday":{"open":"08:00","close":"19:00","closed":false},"wednesday":{"open":"08:00","close":"19:00","closed":false},"thursday":{"open":"08:00","close":"19:00","closed":false},"friday":{"open":"08:00","close":"20:00","closed":false},"saturday":{"open":"07:00","close":"20:00","closed":false},"sunday":{"open":"09:00","close":"17:00","closed":false}}',
    NOW(), NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  approved = EXCLUDED.approved,
  owner_id = EXCLUDED.owner_id,
  location = EXCLUDED.location,
  contact = EXCLUDED.contact,
  business_hours = EXCLUDED.business_hours;

-- Step 4: Add a sample broadcast request (as if a customer asked for a plumber — 
-- will help test the merchant leads dashboard immediately)
INSERT INTO public.broadcast_requests (id, user_id, category, description, budget, status, created_at, updated_at)
VALUES
  (
    'cccccccc-0001-4000-c000-000000000001',
    'aaaaaaaa-1111-4000-a000-000000000001',
    'Electronics Repair',
    'My laptop screen is cracked and I need it fixed urgently. HP Pavilion 15 inch. Can someone give me a quote today?',
    '5000',
    'open',
    NOW(), NOW()
  ),
  (
    'cccccccc-0002-4000-c000-000000000002',
    'aaaaaaaa-2222-4000-a000-000000000002',
    'Restaurant',
    'Looking for catering for a birthday party of 30 people this Saturday. Need nyama choma, pilau, and drinks. Budget flexible.',
    '15000',
    'open',
    NOW(), NOW()
  ),
  (
    'cccccccc-0003-4000-c000-000000000003',
    'aaaaaaaa-3333-4000-a000-000000000003',
    'Salon & Barber',
    'I need bridal hair styling and makeup for my wedding next month. Party of 5 bridesmaids plus the bride.',
    '20000',
    'open',
    NOW(), NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- DONE! You can now test with:
--
-- CUSTOMER SIDE (broadcast a request):
--   Log in with your own account → AskBizHub → search → Broadcast
--   Or go to /requests to see the sample requests above
--
-- MERCHANT SIDE (see leads & respond):
--   Log in as merchant1@test.com (password: TestPass123!)
--     → /dashboard/leads → sees "Electronics Repair" request from merchant2
--     → Can also see "Salon" request from merchant3 (wrong category, won't show)
--     → Restaurant requests WILL show (matches Mama Njeri's category)
--
--   Log in as merchant2@test.com (password: TestPass123!)
--     → /dashboard/leads → sees "Electronics Repair" requests
--
--   Log in as merchant3@test.com (password: TestPass123!)
--     → /dashboard/leads → sees "Salon & Barber" requests
-- ================================================================
