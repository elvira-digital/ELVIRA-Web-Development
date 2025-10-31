-- RLS Policies to allow guests to cancel their own pending orders/requests
-- These policies allow authenticated guests to UPDATE only their own pending orders to "cancelled" status

-- =====================================================
-- AMENITY REQUESTS - Allow guests to cancel their own pending requests
-- =====================================================
alter policy "Guests can insert their own amenity requests"
on "public"."amenity_requests"
to authenticated
using (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid)
)
with check (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid)
);

create policy "Guests can cancel their own pending amenity requests"
on "public"."amenity_requests"
as permissive
for update
to authenticated
using (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid) AND
  (status = 'pending'::text)
)
with check (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid) AND
  (status = 'cancelled'::text)
);

-- =====================================================
-- DINE IN ORDERS - Allow guests to cancel their own pending orders
-- =====================================================
create policy "Guests can cancel their own pending dine in orders"
on "public"."dine_in_orders"
as permissive
for update
to authenticated
using (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid) AND
  (status = 'pending'::text)
)
with check (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid) AND
  (status = 'cancelled'::text)
);

-- =====================================================
-- SHOP ORDERS - Allow guests to cancel their own pending orders
-- =====================================================
create policy "Guests can cancel their own pending shop orders"
on "public"."shop_orders"
as permissive
for update
to authenticated
using (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid) AND
  (status = 'pending'::text)
)
with check (
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  (guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid) AND
  (hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid) AND
  (status = 'cancelled'::text)
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the policies were created successfully:

-- Check amenity_requests policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'amenity_requests' AND policyname LIKE '%cancel%';

-- Check dine_in_orders policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'dine_in_orders' AND policyname LIKE '%cancel%';

-- Check shop_orders policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'shop_orders' AND policyname LIKE '%cancel%';
