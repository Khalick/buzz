-- Create the merchant_requests table
CREATE TABLE IF NOT EXISTS public.merchant_requests (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Turn on Row Level Security
ALTER TABLE public.merchant_requests ENABLE ROW LEVEL SECURITY;

-- Policy allowing users to insert their own requests
CREATE POLICY "Users can insert their own merchant requests" 
    ON public.merchant_requests FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy allowing users to view their own requests
CREATE POLICY "Users can view their own merchant requests" 
    ON public.merchant_requests FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy allowing admins to read all requests
CREATE POLICY "Admins can view all merchant requests" 
    ON public.merchant_requests FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Policy allowing admins to update requests
CREATE POLICY "Admins can update merchant requests" 
    ON public.merchant_requests FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );
