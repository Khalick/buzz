-- ================================================================
-- BIZHUB SECURITY HARDENING SCRIPT
-- Addresses Section 5 from Implementation Plan (Security & Data Integrity)
-- Run this in your Supabase SQL Editor.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. INPUT VALIDATION & SANITIZATION (5.B)
-- ----------------------------------------------------------------

-- Add Rejection Reason & Re-submission support to merchant_requests
ALTER TABLE public.merchant_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.merchant_requests ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.merchant_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add a constraint for phone validation on merchant requests
-- Matches simple + country code and up to 15 digits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'phone_number_format'
  ) THEN
    ALTER TABLE public.merchant_requests ADD CONSTRAINT phone_number_format
    CHECK (contact_phone ~ '^[+]?[0-9]{10,15}$');
  END IF;
END $$;

-- Add business name length limits on newly created businesses if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'businesses_name_length' AND table_name = 'businesses'
  ) THEN
    ALTER TABLE public.businesses ADD CONSTRAINT businesses_name_length
    CHECK (char_length(name) >= 2 AND char_length(name) <= 100);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If column doesn't exist or other error, suppress
END $$;


-- ----------------------------------------------------------------
-- 2. RATE LIMITING & UNIQUENESS CONSTRAINTS (5.A)
-- ----------------------------------------------------------------

-- Prevent multiple pending merchant requests from the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_merchant_requests_unique_pending 
ON public.merchant_requests(user_id) 
WHERE status = 'pending';

-- Prevent multiple reviews from the same user for the same business
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_user_business 
ON public.reviews(user_id, business_id);


-- ----------------------------------------------------------------
-- 3. AUDIT TRAIL COMPLETENESS (5.C)
-- ----------------------------------------------------------------

-- The security_audit_log table was created in security_rls_policies.sql
-- We create the centralized trigger function to auto-log changes

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger AS $$
DECLARE
  uid UUID;
BEGIN
  -- Get the acting user ID (could be auth.uid() or a service role if null)
  uid := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (user_id, action, resource_type, resource_id, metadata)
    VALUES (uid, 'CREATE_' || TG_TABLE_NAME, TG_TABLE_NAME, NEW.id::text, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log the diff
    INSERT INTO public.security_audit_log (user_id, action, resource_type, resource_id, metadata)
    VALUES (uid, 'UPDATE_' || TG_TABLE_NAME, TG_TABLE_NAME, NEW.id::text, 
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_log (user_id, action, resource_type, resource_id, metadata)
    VALUES (uid, 'DELETE_' || TG_TABLE_NAME, TG_TABLE_NAME, OLD.id::text, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Apply the audit trigger to sensitive tables and actions

-- 3a. Audit merchant approvals/rejections
DROP TRIGGER IF EXISTS audit_merchant_requests ON public.merchant_requests;
CREATE TRIGGER audit_merchant_requests
AFTER INSERT OR UPDATE OR DELETE ON public.merchant_requests
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- 3b. Audit user role changes
DROP TRIGGER IF EXISTS audit_users_role ON public.users;
CREATE TRIGGER audit_users_role
AFTER UPDATE OF role ON public.users
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- 3c. Audit business status changes
DROP TRIGGER IF EXISTS audit_businesses_approved ON public.businesses;
CREATE TRIGGER audit_businesses_approved
AFTER UPDATE OF approved ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
