-- Query all resources needed for order generation
-- Run this in Supabase SQL Editor
-- Hotel ID: Centro Hotel Mondial

-- SUMMARY COUNTS
SELECT 'AMENITIES' as resource_type, COUNT(*)::text as count FROM amenities 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
SELECT 'RESTAURANTS', COUNT(*)::text FROM restaurants 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
SELECT 'MENU_ITEMS', COUNT(*)::text FROM menu_items 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
SELECT 'LAUNDRY_SERVICES', COUNT(*)::text FROM laundry_services 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
SELECT 'PRODUCTS (SHOP)', COUNT(*)::text FROM products 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true;

-- DETAILED LISTS
-- Amenities
SELECT 'AMENITY' as type, id, name || ' (' || category || ')' as details FROM amenities 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
-- Restaurants
SELECT 'RESTAURANT', id, name || ' - ' || COALESCE(cuisine_type, 'N/A') FROM restaurants 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
-- Menu Items
SELECT 'MENU_ITEM', id, name || ' (' || category || ') - $' || price::text FROM menu_items 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
-- Laundry Services
SELECT 'LAUNDRY', id, category || ': ' || COALESCE(description, 'N/A') || ' ($' || price::text || ')' FROM laundry_services 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
UNION ALL
-- Products (Shop Items)
SELECT 'PRODUCT', id, name || ' (' || category || ') - $' || price::text FROM products 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' AND is_active = true
ORDER BY type, details;
