-- disable_all_constraints.sql
-- This absolutely wipes any remaining "CHECK" constraints (rules about exact wording like 'Delivered' vs 'delivered') 
-- that were clinging to your older database schema.

CREATE OR REPLACE FUNCTION public.strip_all_checks()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tc.table_schema, tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public' 
    AND tc.table_name IN (
      'featured_placements', 
      'promotions', 
      'invoices', 
      'support_tickets', 
      'broadcasts', 
      'franchise_groups', 
      'search_tuning_rules'
    )
    AND tc.constraint_type = 'CHECK'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I', rec.table_schema, rec.table_name, rec.constraint_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END;
$$;

SELECT public.strip_all_checks();
DROP FUNCTION public.strip_all_checks();
NOTIFY pgrst, 'reload schema';
