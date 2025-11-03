-- Migration: 009_create_laundry_orders
-- Create laundry orders and laundry order items tables

-- Create laundry_orders table
CREATE TABLE IF NOT EXISTS public.laundry_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    total_price NUMERIC(10,2) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME,
    delivery_date DATE NOT NULL,
    delivery_time TIME,
    special_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    updated_at_by UUID REFERENCES public.profiles(id)
);

-- Create laundry_order_items table
CREATE TABLE IF NOT EXISTS public.laundry_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.laundry_orders(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.laundry_services(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_order NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_laundry_orders_guest_id ON public.laundry_orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_hotel_id ON public.laundry_orders(hotel_id);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_status ON public.laundry_orders(status);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_pickup_date ON public.laundry_orders(pickup_date);
CREATE INDEX IF NOT EXISTS idx_laundry_orders_delivery_date ON public.laundry_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_laundry_order_items_order_id ON public.laundry_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_laundry_order_items_service_id ON public.laundry_order_items(service_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_laundry_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_laundry_orders_updated_at
    BEFORE UPDATE ON public.laundry_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_laundry_orders_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.laundry_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laundry_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for laundry_orders

-- Guests can view their own orders
CREATE POLICY "Guests can view their own laundry orders"
    ON public.laundry_orders
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND guest_id IN (
            SELECT id FROM public.guests 
            WHERE user_id = auth.uid()
        )
    );

-- Guests can insert their own orders
CREATE POLICY "Guests can create their own laundry orders"
    ON public.laundry_orders
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND guest_id IN (
            SELECT id FROM public.guests 
            WHERE user_id = auth.uid()
        )
    );

-- Guests can update their own pending orders (for cancellation)
CREATE POLICY "Guests can update their own pending laundry orders"
    ON public.laundry_orders
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND guest_id IN (
            SELECT id FROM public.guests 
            WHERE user_id = auth.uid()
        )
        AND status = 'pending'
    );

-- Hotel staff can view orders for their hotel
CREATE POLICY "Hotel staff can view laundry orders for their hotel"
    ON public.laundry_orders
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND hotel_id IN (
            SELECT hotel_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Hotel staff can update orders for their hotel
CREATE POLICY "Hotel staff can update laundry orders for their hotel"
    ON public.laundry_orders
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND hotel_id IN (
            SELECT hotel_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for laundry_order_items

-- Allow access to order items if user can access the parent order
CREATE POLICY "Users can view laundry order items for accessible orders"
    ON public.laundry_order_items
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND order_id IN (
            SELECT id FROM public.laundry_orders
            WHERE (
                -- Guest can view their own orders
                guest_id IN (
                    SELECT id FROM public.guests 
                    WHERE user_id = auth.uid()
                )
            ) OR (
                -- Hotel staff can view orders for their hotel
                hotel_id IN (
                    SELECT hotel_id FROM public.profiles 
                    WHERE id = auth.uid()
                )
            )
        )
    );

-- Guests can insert order items for their own orders
CREATE POLICY "Guests can create laundry order items for their own orders"
    ON public.laundry_order_items
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND order_id IN (
            SELECT id FROM public.laundry_orders
            WHERE guest_id IN (
                SELECT id FROM public.guests 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Hotel staff can insert order items for orders in their hotel
CREATE POLICY "Hotel staff can create laundry order items for their hotel"
    ON public.laundry_order_items
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND order_id IN (
            SELECT id FROM public.laundry_orders
            WHERE hotel_id IN (
                SELECT hotel_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Add comments for documentation
COMMENT ON TABLE public.laundry_orders IS 'Stores laundry service orders placed by guests';
COMMENT ON TABLE public.laundry_order_items IS 'Stores individual laundry services within an order';

COMMENT ON COLUMN public.laundry_orders.status IS 'Order status: pending, confirmed, in_progress, ready, delivered, cancelled';
COMMENT ON COLUMN public.laundry_orders.pickup_date IS 'Date when laundry will be picked up from guest room';
COMMENT ON COLUMN public.laundry_orders.delivery_date IS 'Date when laundry will be delivered back to guest room';
COMMENT ON COLUMN public.laundry_order_items.price_at_order IS 'Price of the service at the time the order was placed (for price history)';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.laundry_orders TO authenticated;
GRANT SELECT, INSERT ON public.laundry_order_items TO authenticated;

-- Enable realtime for order tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.laundry_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.laundry_order_items;