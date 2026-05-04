ALTER TABLE public.broadcast_requests 
ADD COLUMN IF NOT EXISTS target_businesses text[] DEFAULT NULL;
