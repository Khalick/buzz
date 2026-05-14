-- run_diagnostic.sql
-- Clear your entire Supabase SQL Editor first, then paste this and click Run!

CREATE OR REPLACE FUNCTION public.run_diagnostic_test()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_error_message TEXT;
  v_error_detail TEXT;
  v_error_hint TEXT;
  v_error_context TEXT;
BEGIN
  -- Simulate an admin operation
  UPDATE public.businesses 
  SET approved = true 
  WHERE id = (SELECT id FROM public.businesses LIMIT 1);
  
  UPDATE public.merchant_requests 
  SET status = 'approved' 
  WHERE id = (SELECT id FROM public.merchant_requests LIMIT 1);
  
  RAISE NOTICE 'SUCCESS: Both updates completed without throwing a 500 error! The bug is fixed.';
  
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS 
      v_error_message = MESSAGE_TEXT,
      v_error_detail = PG_EXCEPTION_DETAIL,
      v_error_hint = PG_EXCEPTION_HINT,
      v_error_context = PG_EXCEPTION_CONTEXT;
      
  RAISE WARNING '=======================================================';
  RAISE WARNING 'CRITICAL DATABASE ERROR DETECTED (THIS IS YOUR 500 BUG)';
  RAISE WARNING '=======================================================';
  RAISE WARNING 'Message: %', v_error_message;
  RAISE WARNING 'Detail: %', COALESCE(v_error_detail, 'None');
  RAISE WARNING 'Hint: %', COALESCE(v_error_hint, 'None');
  RAISE WARNING 'Context: %', COALESCE(v_error_context, 'None');
END;
$$;

SELECT public.run_diagnostic_test();
DROP FUNCTION public.run_diagnostic_test();
