-- ================================================================
-- FIX: Auto-create public.users row on signup
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- 1. Trigger function: auto-create public.users row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

-- 2. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Add INSERT RLS policy so client-side fallback inserts also work
DROP POLICY IF EXISTS "usr_insert" ON public.users;
CREATE POLICY "usr_insert" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- 4. Backfill: create public.users rows for any existing auth users
--    that don't already have one
INSERT INTO public.users (id, email, display_name, role, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'user',
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
