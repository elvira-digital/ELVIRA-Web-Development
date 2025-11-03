-- Create laundry_services table
CREATE TABLE IF NOT EXISTS public.laundry_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_laundry_services_hotel_id ON public.laundry_services(hotel_id);
CREATE INDEX IF NOT EXISTS idx_laundry_services_is_active ON public.laundry_services(is_active);

-- Enable RLS
ALTER TABLE public.laundry_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for laundry_services

-- Policy: Hotel staff can view their hotel's laundry services
CREATE POLICY "Hotel staff can view their hotel laundry services"
ON public.laundry_services
FOR SELECT
USING (
    hotel_id IN (
        SELECT hotel_id 
        FROM public.hotel_staff 
        WHERE user_id = auth.uid()
    )
);

-- Policy: Hotel staff can insert laundry services for their hotel
CREATE POLICY "Hotel staff can insert laundry services"
ON public.laundry_services
FOR INSERT
WITH CHECK (
    hotel_id IN (
        SELECT hotel_id 
        FROM public.hotel_staff 
        WHERE user_id = auth.uid()
    )
);

-- Policy: Hotel staff can update their hotel's laundry services
CREATE POLICY "Hotel staff can update their hotel laundry services"
ON public.laundry_services
FOR UPDATE
USING (
    hotel_id IN (
        SELECT hotel_id 
        FROM public.hotel_staff 
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    hotel_id IN (
        SELECT hotel_id 
        FROM public.hotel_staff 
        WHERE user_id = auth.uid()
    )
);

-- Policy: Hotel staff can delete their hotel's laundry services
CREATE POLICY "Hotel staff can delete their hotel laundry services"
ON public.laundry_services
FOR DELETE
USING (
    hotel_id IN (
        SELECT hotel_id 
        FROM public.hotel_staff 
        WHERE user_id = auth.uid()
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_laundry_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_laundry_services_updated_at
    BEFORE UPDATE ON public.laundry_services
    FOR EACH ROW
    EXECUTE FUNCTION update_laundry_services_updated_at();

-- Add comment
COMMENT ON TABLE public.laundry_services IS 'Stores laundry service categories and pricing for hotels';
