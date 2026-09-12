-- ============================================================
-- Seed Data: seed.sql
-- Description: Realistic seed data for Community Fund Management App
--              Tamil community context with Indian names and INR amounts
-- Created: 2026-09-02
-- ============================================================

-- ============================================================
-- IMPORTANT NOTE ON AUTH USERS
-- ============================================================
-- In a hosted Supabase project, auth users CANNOT be created
-- via raw SQL inserts in production (the auth schema is managed
-- internally). To create auth users, use one of these methods:
--
--   1. Supabase Dashboard -> Authentication -> Users -> "Invite user"
--   2. Supabase Auth API: POST /auth/v1/admin/users  (service_role key required)
--   3. supabase.auth.admin.createUser() in a server-side script
--   4. For LOCAL development only (supabase start), you may insert
--      directly into auth.users using the statements below.
--
-- The placeholder UUIDs used below must match the actual UUIDs
-- assigned by Supabase after you create the users via the methods
-- above. Replace the placeholder UUIDs accordingly before running
-- the profiles/members/functions/contributions/expenses inserts.
--
-- PLACEHOLDER UUID LEGEND:
--   Admin 1  (Murugan Rajan)        -> '00000000-0000-0000-0000-000000000001'
--   Admin 2  (Selvam Krishnan)      -> '00000000-0000-0000-0000-000000000002'
--   Visitor 1 (Anbu Durai)         -> '00000000-0000-0000-0000-000000000003'
--   Visitor 2 (Kannan Subramanian) -> '00000000-0000-0000-0000-000000000004'
--   Visitor 3 (Ravi Chandran)      -> '00000000-0000-0000-0000-000000000005'
--   Visitor 4 (Vijaya Lakshmi)     -> '00000000-0000-0000-0000-000000000006'
--   Visitor 5 (Priya Natarajan)    -> '00000000-0000-0000-0000-000000000007'
-- ============================================================

-- ============================================================
-- AUTH USERS (LOCAL DEVELOPMENT ONLY)
-- Remove or comment out this section for hosted Supabase.
-- These use Supabase's internal auth.users structure.
-- ============================================================

/*
-- Uncomment for local Supabase development only:

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
values
  -- Admin 1
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'murugan.admin@communityfund.in',
    crypt('Admin@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Murugan Rajan", "role": "admin"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Admin 2
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'selvam.admin@communityfund.in',
    crypt('Admin@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Selvam Krishnan", "role": "admin"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Visitor 1
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'anbu.durai@gmail.com',
    crypt('Visitor@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Anbu Durai", "role": "visitor"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Visitor 2
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'kannan.sub@gmail.com',
    crypt('Visitor@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Kannan Subramanian", "role": "visitor"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Visitor 3
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'ravi.chandran@gmail.com',
    crypt('Visitor@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Ravi Chandran", "role": "visitor"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Visitor 4
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'vijaya.lakshmi@gmail.com',
    crypt('Visitor@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Vijaya Lakshmi", "role": "visitor"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    false, '', '', '', ''
  ),
  -- Visitor 5
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'priya.natarajan@gmail.com',
    crypt('Visitor@1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Priya Natarajan", "role": "visitor"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    false, '', '', '', ''
  );
*/

-- ============================================================
-- PROFILES
-- NOTE: The handle_new_user trigger auto-creates profiles on
-- auth.users insert. These inserts are for hosted Supabase where
-- auth users are created via the Auth API (trigger fires automatically).
-- Run these ONLY if the trigger did NOT fire or you need to patch data.
-- Replace placeholder UUIDs with real UUIDs from your Supabase project.
-- ============================================================

insert into public.profiles (id, role, full_name, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'admin',   'Murugan Rajan',        now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'admin',   'Selvam Krishnan',      now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'visitor', 'Anbu Durai',           now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'visitor', 'Kannan Subramanian',   now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'visitor', 'Ravi Chandran',        now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'visitor', 'Vijaya Lakshmi',       now(), now()),
  ('00000000-0000-0000-0000-000000000007', 'visitor', 'Priya Natarajan',      now(), now())
on conflict (id) do update
  set role       = excluded.role,
      full_name  = excluded.full_name,
      updated_at = now();

-- ============================================================
-- MEMBERS (10 Tamil community members)
-- ============================================================

insert into public.members (id, member_id, full_name, phone, email, status, join_date, created_by, created_at, updated_at)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'MBR001', 'Murugan Rajan',
    '919842134567', 'murugan.rajan@gmail.com',
    'active', '2022-01-15',
    '00000000-0000-0000-0000-000000000001',
    '2022-01-15 09:00:00+05:30', '2022-01-15 09:00:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'MBR002', 'Selvam Krishnan',
    '919751234890', 'selvam.krishnan@gmail.com',
    'active', '2022-01-20',
    '00000000-0000-0000-0000-000000000001',
    '2022-01-20 10:00:00+05:30', '2022-01-20 10:00:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'MBR003', 'Anbu Durai',
    '919943256789', 'anbu.durai@gmail.com',
    'active', '2022-02-05',
    '00000000-0000-0000-0000-000000000001',
    '2022-02-05 11:00:00+05:30', '2022-02-05 11:00:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    'MBR004', 'Kannan Subramanian',
    '919865345678', 'kannan.sub@gmail.com',
    'active', '2022-02-18',
    '00000000-0000-0000-0000-000000000001',
    '2022-02-18 09:30:00+05:30', '2022-02-18 09:30:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    'MBR005', 'Ravi Chandran',
    '919787456789', 'ravi.chandran@gmail.com',
    'active', '2022-03-01',
    '00000000-0000-0000-0000-000000000001',
    '2022-03-01 10:15:00+05:30', '2022-03-01 10:15:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000006',
    'MBR006', 'Vijaya Lakshmi',
    '919698567890', 'vijaya.lakshmi@gmail.com',
    'active', '2022-03-10',
    '00000000-0000-0000-0000-000000000001',
    '2022-03-10 11:00:00+05:30', '2022-03-10 11:00:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000007',
    'MBR007', 'Priya Natarajan',
    '919944678901', 'priya.natarajan@gmail.com',
    'active', '2022-04-05',
    '00000000-0000-0000-0000-000000000001',
    '2022-04-05 09:00:00+05:30', '2022-04-05 09:00:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000008',
    'MBR008', 'Thangavel Periyasamy',
    '919842789012', 'thangavel.p@gmail.com',
    'active', '2022-04-20',
    '00000000-0000-0000-0000-000000000001',
    '2022-04-20 10:30:00+05:30', '2022-04-20 10:30:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000009',
    'MBR009', 'Meenakshi Sundaram',
    '919751890123', 'meenakshi.s@gmail.com',
    'active', '2022-05-01',
    '00000000-0000-0000-0000-000000000001',
    '2022-05-01 09:45:00+05:30', '2022-05-01 09:45:00+05:30'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000010',
    'MBR010', 'Palaniappan Govindan',
    '919943901234', 'palani.govindan@gmail.com',
    'inactive', '2022-05-15',
    '00000000-0000-0000-0000-000000000001',
    '2022-05-15 11:15:00+05:30', '2022-05-15 11:15:00+05:30'
  );

-- ============================================================
-- FUNCTIONS (2 community events)
-- ============================================================

insert into public.functions (id, name, type, start_year, end_year, description, status, created_by, created_at, updated_at)
values
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    '2026 Purattasi Sani Kiyamai',
    'ANNUAL',
    2026,
    null,
    'Annual sacred Purattasi Sani Kiyamai celebration with Balaji pooja, thirumanjanam, and Annadhanam feast. Open to all registered community members and their families.',
    'active',
    '00000000-0000-0000-0000-000000000001',
    '2025-08-01 10:00:00+05:30', '2025-08-01 10:00:00+05:30'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    '2026-2029 Gokulaashdami',
    'FOUR_YEAR',
    2026,
    2029,
    'Quadrennial grand Gokulaashdami festival cycle spanning four years of community seva, spiritual celebrations, and cultural initiatives.',
    'active',
    '00000000-0000-0000-0000-000000000001',
    '2025-09-01 10:00:00+05:30', '2025-09-01 10:00:00+05:30'
  );

-- ============================================================
-- CONTRIBUTIONS (18 entries across both functions)
-- ============================================================

insert into public.contributions (
  id, function_id, member_id, amount, payment_method,
  payment_date, reference_number, notes, created_by, created_at, updated_at
)
values
  -- Annual Function contributions
  (
    'cccccccc-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    5000.00, 'upi', '2025-10-05',
    'UPI/250005/MURGN01', 'First instalment for annual function',
    '00000000-0000-0000-0000-000000000001',
    '2025-10-05 11:00:00+05:30', '2025-10-05 11:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002',
    10000.00, 'bank_transfer', '2025-10-10',
    'NEFT/25100010/SELKRI', 'Bank transfer from Selvam Krishnan',
    '00000000-0000-0000-0000-000000000001',
    '2025-10-10 09:30:00+05:30', '2025-10-10 09:30:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000003',
    2500.00, 'cash', '2025-10-15',
    null, 'Cash collected at monthly meeting',
    '00000000-0000-0000-0000-000000000001',
    '2025-10-15 18:00:00+05:30', '2025-10-15 18:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000004',
    7500.00, 'upi', '2025-11-01',
    'UPI/251101/KANNSUB', 'UPI payment from Kannan',
    '00000000-0000-0000-0000-000000000001',
    '2025-11-01 10:00:00+05:30', '2025-11-01 10:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000005',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000005',
    3000.00, 'cash', '2025-11-10',
    null, 'Cash contribution from Ravi',
    '00000000-0000-0000-0000-000000000001',
    '2025-11-10 17:30:00+05:30', '2025-11-10 17:30:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000006',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000006',
    1500.00, 'upi', '2025-11-20',
    'UPI/251120/VIJLAK', 'UPI transfer - Vijaya Lakshmi',
    '00000000-0000-0000-0000-000000000002',
    '2025-11-20 12:00:00+05:30', '2025-11-20 12:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000007',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000007',
    2000.00, 'upi', '2025-12-01',
    'UPI/251201/PRIYNAT', 'Online UPI payment',
    '00000000-0000-0000-0000-000000000002',
    '2025-12-01 09:00:00+05:30', '2025-12-01 09:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000008',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000008',
    5000.00, 'bank_transfer', '2025-12-10',
    'IMPS/25121015/THGVL', 'IMPS transfer from Thangavel',
    '00000000-0000-0000-0000-000000000001',
    '2025-12-10 10:30:00+05:30', '2025-12-10 10:30:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000009',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000009',
    25000.00, 'bank_transfer', '2026-01-05',
    'NEFT/26010512/MEENKS', 'Major donation for annual function hall booking',
    '00000000-0000-0000-0000-000000000001',
    '2026-01-05 11:00:00+05:30', '2026-01-05 11:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000010',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000001',
    3000.00, 'upi', '2026-02-14',
    'UPI/260214/MURGN02', 'Second instalment - annual function',
    '00000000-0000-0000-0000-000000000001',
    '2026-02-14 09:00:00+05:30', '2026-02-14 09:00:00+05:30'
  ),

  -- Four-Year Function contributions
  (
    'cccccccc-0000-0000-0000-000000000011',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000001',
    15000.00, 'bank_transfer', '2025-10-01',
    'NEFT/25100101/MURGN4Y', 'Four-year fund - founding contribution',
    '00000000-0000-0000-0000-000000000001',
    '2025-10-01 09:00:00+05:30', '2025-10-01 09:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000012',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000002',
    20000.00, 'bank_transfer', '2025-10-05',
    'RTGS/25100506/SELKRI4Y', 'RTGS transfer - major sponsor',
    '00000000-0000-0000-0000-000000000001',
    '2025-10-05 09:30:00+05:30', '2025-10-05 09:30:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000013',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000004',
    10000.00, 'upi', '2025-11-15',
    'UPI/251115/KANN4Y', 'Four-year fund UPI payment',
    '00000000-0000-0000-0000-000000000002',
    '2025-11-15 10:00:00+05:30', '2025-11-15 10:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000014',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000005',
    500.00, 'cash', '2025-12-20',
    null, 'Cash - small but steady contribution',
    '00000000-0000-0000-0000-000000000002',
    '2025-12-20 18:30:00+05:30', '2025-12-20 18:30:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000015',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000008',
    8000.00, 'upi', '2026-01-10',
    'UPI/260110/THGVL4Y', 'New year contribution to four-year fund',
    '00000000-0000-0000-0000-000000000001',
    '2026-01-10 10:00:00+05:30', '2026-01-10 10:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000016',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000009',
    12000.00, 'bank_transfer', '2026-02-01',
    'NEFT/26020101/MEENKS4Y', 'Quarterly contribution - Q1 2026',
    '00000000-0000-0000-0000-000000000001',
    '2026-02-01 09:15:00+05:30', '2026-02-01 09:15:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000017',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000006',
    2500.00, 'other', '2026-02-20',
    'CHQ/26022001/VIJLAK', 'Cheque contribution - four-year fund',
    '00000000-0000-0000-0000-000000000002',
    '2026-02-20 11:00:00+05:30', '2026-02-20 11:00:00+05:30'
  ),
  (
    'cccccccc-0000-0000-0000-000000000018',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003',
    4000.00, 'upi', '2026-03-15',
    'UPI/260315/ANBUDURAI4Y', 'March instalment - four-year fund',
    '00000000-0000-0000-0000-000000000001',
    '2026-03-15 10:30:00+05:30', '2026-03-15 10:30:00+05:30'
  );

-- ============================================================
-- EXPENSES (20 entries, all 10 categories covered)
-- ============================================================

insert into public.expenses (
  id, function_id, category, description, amount, payment_method,
  expense_date, reference_number, notes, receipt_url, created_by, created_at, updated_at
)
values
  -- Annual Function expenses

  -- food
  (
    'dddddddd-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'food',
    'Sadhya catering for 300 guests - Murugan Catering Services',
    45000.00, 'bank_transfer', '2026-03-20',
    'NEFT/26032012/CATER01',
    'Includes full vegetarian sadhya with payasam and papad',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-03-20 14:00:00+05:30', '2026-03-20 14:00:00+05:30'
  ),
  -- hall
  (
    'dddddddd-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'hall',
    'Town Hall rental - Madurai Cultural Centre (2 days)',
    30000.00, 'bank_transfer', '2025-11-15',
    'NEFT/25111501/HALL01',
    'Advance booking for annual function. Hall capacity 500.',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2025-11-15 10:00:00+05:30', '2025-11-15 10:00:00+05:30'
  ),
  -- decoration
  (
    'dddddddd-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'decoration',
    'Stage decoration, floral arrangements, and entrance arch',
    18000.00, 'cash', '2026-03-18',
    null,
    'Marigold and rose garlands, banana stems, traditional kolam',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-03-18 09:00:00+05:30', '2026-03-18 09:00:00+05:30'
  ),
  -- transportation
  (
    'dddddddd-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'transportation',
    'Bus hire for outstation guests - Coimbatore to Madurai (3 buses)',
    12000.00, 'cash', '2026-03-21',
    null,
    'Tempo Traveller x3 for guest pickup and drop',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-03-21 07:00:00+05:30', '2026-03-21 07:00:00+05:30'
  ),
  -- cultural_religious
  (
    'dddddddd-0000-0000-0000-000000000005',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'cultural_religious',
    'Nadaswaram troupe and Carnatic vocal concert',
    25000.00, 'cash', '2026-03-22',
    null,
    'Vidwan Muthusamy Pillai nadaswaram + classical concert in the evening',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-03-22 08:00:00+05:30', '2026-03-22 08:00:00+05:30'
  ),
  -- printing
  (
    'dddddddd-0000-0000-0000-000000000006',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'printing',
    'Invitation cards (500 copies), banners (10), and flex boards',
    8500.00, 'upi', '2026-02-28',
    'UPI/260228/PRINT01',
    'Printed at Sri Murugan Offset Press, Madurai',
    null,
    '00000000-0000-0000-0000-000000000002',
    '2026-02-28 11:30:00+05:30', '2026-02-28 11:30:00+05:30'
  ),
  -- sound_system
  (
    'dddddddd-0000-0000-0000-000000000007',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'sound_system',
    'PA sound system and LED projector rental (2 days)',
    15000.00, 'upi', '2026-03-19',
    'UPI/260319/SOUND01',
    '20000W PA system, 2 projectors, 4 LED screens',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-03-19 15:00:00+05:30', '2026-03-19 15:00:00+05:30'
  ),
  -- gifts
  (
    'dddddddd-0000-0000-0000-000000000008',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'gifts',
    'Felicitation shawls and trophies for achievers (15 sets)',
    9000.00, 'cash', '2026-03-10',
    null,
    'Silk shawls x15, bronze trophies x15 from Meenakshi Silks',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-03-10 10:00:00+05:30', '2026-03-10 10:00:00+05:30'
  ),
  -- utilities
  (
    'dddddddd-0000-0000-0000-000000000009',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'utilities',
    'Generator rental and fuel for 2-day event',
    7500.00, 'cash', '2026-03-22',
    null,
    '25 KVA generator hired from Rajan Power Solutions',
    null,
    '00000000-0000-0000-0000-000000000002',
    '2026-03-22 18:00:00+05:30', '2026-03-22 18:00:00+05:30'
  ),
  -- miscellaneous
  (
    'dddddddd-0000-0000-0000-000000000010',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'miscellaneous',
    'First aid supplies, security staff, and miscellaneous petty expenses',
    3500.00, 'cash', '2026-03-22',
    null,
    'First aid kit, 2 security personnel, stationary, drinking water cans',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-03-22 20:00:00+05:30', '2026-03-22 20:00:00+05:30'
  ),

  -- Four-Year Function expenses

  -- food
  (
    'dddddddd-0000-0000-0000-000000000011',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'food',
    'Grand dinner for 500 guests - Pandian Catering',
    75000.00, 'bank_transfer', '2026-07-15',
    'NEFT/26071501/CATER4Y',
    'Multi-cuisine dinner including Tamil, North Indian and desserts',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-07-15 20:00:00+05:30', '2026-07-15 20:00:00+05:30'
  ),
  -- hall
  (
    'dddddddd-0000-0000-0000-000000000012',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'hall',
    'Convention centre rental - Tirunelveli (3 days)',
    60000.00, 'bank_transfer', '2026-05-01',
    'NEFT/26050101/HALL4Y',
    'AC convention centre, 1000 capacity, includes parking',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-05-01 10:00:00+05:30', '2026-05-01 10:00:00+05:30'
  ),
  -- decoration
  (
    'dddddddd-0000-0000-0000-000000000013',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'decoration',
    'Grand entrance gate, stage backdrop and pandal decoration',
    35000.00, 'upi', '2026-07-10',
    'UPI/260710/DECO4Y',
    'Traditional Tamil themed decoration with lights and flowers',
    null,
    '00000000-0000-0000-0000-000000000002',
    '2026-07-10 09:00:00+05:30', '2026-07-10 09:00:00+05:30'
  ),
  -- transportation
  (
    'dddddddd-0000-0000-0000-000000000014',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'transportation',
    'AC coach hire for members from Chennai and Coimbatore',
    22000.00, 'bank_transfer', '2026-07-14',
    'NEFT/26071401/TRANS4Y',
    '2 x AC Volvo coaches for outstation member transport',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-07-14 06:00:00+05:30', '2026-07-14 06:00:00+05:30'
  ),
  -- cultural_religious
  (
    'dddddddd-0000-0000-0000-000000000015',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'cultural_religious',
    'Homam and pooja items, purohit fees for inauguration ceremony',
    18000.00, 'cash', '2026-07-13',
    null,
    'Ganapathi homam, 3 purohits, 2-hour pooja with all samagri',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-07-13 06:00:00+05:30', '2026-07-13 06:00:00+05:30'
  ),
  -- printing
  (
    'dddddddd-0000-0000-0000-000000000016',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'printing',
    'Souvenir magazine (200 pages, 1000 copies) + event brochures',
    40000.00, 'bank_transfer', '2026-06-15',
    'NEFT/26061501/PRINT4Y',
    'Full-colour glossy souvenir magazine for four-year function',
    null,
    '00000000-0000-0000-0000-000000000002',
    '2026-06-15 10:00:00+05:30', '2026-06-15 10:00:00+05:30'
  ),
  -- sound_system
  (
    'dddddddd-0000-0000-0000-000000000017',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'sound_system',
    'Professional line-array sound system, LED wall, and livestream setup',
    45000.00, 'bank_transfer', '2026-07-12',
    'NEFT/26071201/SOUND4Y',
    'High-end audio-visual rental + 1 cameraman + YouTube livestream',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-07-12 14:00:00+05:30', '2026-07-12 14:00:00+05:30'
  ),
  -- gifts
  (
    'dddddddd-0000-0000-0000-000000000018',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'gifts',
    'Scholarship certificates, memento shields, and participant gift hampers',
    28000.00, 'upi', '2026-07-01',
    'UPI/260701/GIFTS4Y',
    '10 scholarship certificates, 20 shields, 200 guest gift hampers',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-07-01 11:00:00+05:30', '2026-07-01 11:00:00+05:30'
  ),
  -- utilities
  (
    'dddddddd-0000-0000-0000-000000000019',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'utilities',
    'Generator (100 KVA), electrical cabling and lighting rig (3 days)',
    20000.00, 'cash', '2026-07-15',
    null,
    '100 KVA generator, 500 metres electrical cabling, spotlights',
    null,
    '00000000-0000-0000-0000-000000000002',
    '2026-07-15 21:00:00+05:30', '2026-07-15 21:00:00+05:30'
  ),
  -- miscellaneous
  (
    'dddddddd-0000-0000-0000-000000000020',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'miscellaneous',
    'Photography, videography, and event management coordination fee',
    15000.00, 'upi', '2026-07-16',
    'UPI/260716/MISC4Y',
    'Professional photo + video team, event coordinator daily allowance',
    null,
    '00000000-0000-0000-0000-000000000001',
    '2026-07-16 10:00:00+05:30', '2026-07-16 10:00:00+05:30'
  );

-- ============================================================
-- END OF SEED DATA
-- ============================================================
-- Summary:
--   Profiles      : 7  (2 admins, 5 visitors)
--   Members       : 10 (MBR001-MBR010, 9 active, 1 inactive)
--   Functions     : 2  (1 ANNUAL, 1 FOUR_YEAR)
--   Contributions : 18 (10 annual, 8 four-year)
--   Expenses      : 20 (10 annual, 10 four-year, all 10 categories)
-- ============================================================
