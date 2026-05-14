-- bizhub_fix_auth_500.sql
-- Fixes the tricky "Database error querying schema" bug on Supabase Auth

-- 1. Fix the User Registration trigger
-- The prior version had "SET search_path = ''" which stripped Postgres of its
-- ability to resolve built-in functions like NOW() and split_part(), crashing Sign Ups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_catalog, auth
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 2. Fix the is_admin function safely
-- This guarantees infinite recursion is eliminated AND fixes schema 
-- resolution errors that can crop up when the GoTrue Auth container queries the DB.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Reboot API cache
NOTIFY pgrst, 'reload schema';
