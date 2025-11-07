# Phase 2: Order Generation - Table Structure Reference

## Overview

This document maps the database table structures used in Phase 2 order generation.

## Table Relationships

### 1. Amenity Requests

**Main Table:** `amenity_requests`

- **No junction table needed** - Direct relationship to amenities
- Foreign Keys:
  - `amenity_id` → `amenities.id`
  - `guest_id` → `guests.id`
  - `hotel_id` → `hotels.id`
  - `processed_by` → `profiles.id` (nullable)

**Required Fields:**

- `hotel_id`, `guest_id`, `amenity_id`, `request_date`, `status`, `total_price`

**Optional Fields:**

- `request_time`, `special_instructions`, `processed_by`

---

### 2. Restaurant Orders (Dine-In Orders)

**Main Table:** `dine_in_orders`
**Junction Table:** `dine_in_order_items`

**dine_in_orders** structure:

- Foreign Keys:
  - `guest_id` → `guests.id`
  - `hotel_id` → `hotels.id`
  - `restaurant_id` → `restaurants.id`
  - `processed_by` → `profiles.id` (nullable)

**Required Fields:**

- `hotel_id`, `guest_id`, `order_type`, `total_price`, `status`

**Conditional Fields:**

- If `order_type = 'dine_in'`: `reservation_date`, `reservation_time`, `table_preferences`
- If `order_type = 'room_service'`: `delivery_date`, `delivery_time`

**Optional Fields:**

- `number_of_guests`, `special_instructions`, `processed_by`

**dine_in_order_items** structure:

- Foreign Keys:
  - `order_id` → `dine_in_orders.id`
  - `menu_item_id` → `menu_items.id`

**Required Fields:**

- `order_id`, `menu_item_id`, `quantity`, `price_at_order`

**Important:** Menu items must match the restaurant!

- Check `menu_items.restaurant_ids` array
- If null or empty array → available for all restaurants
- If contains restaurant IDs → only available for those restaurants

---

### 3. Shop Orders

**Main Table:** `shop_orders`
**Junction Table:** `shop_order_items`

**shop_orders** structure:

- Foreign Keys:
  - `guest_id` → `guests.id`
  - `hotel_id` → `hotels.id`
  - `processed_by` → `profiles.id` (nullable)

**Required Fields:**

- `hotel_id`, `guest_id`, `delivery_date`, `total_price`, `status`

**Optional Fields:**

- `delivery_time`, `special_instructions`, `processed_by`

**shop_order_items** structure:

- Foreign Keys:
  - `order_id` → `shop_orders.id`
  - `product_id` → `products.id`

**Required Fields:**

- `order_id`, `product_id`, `quantity`, `price_at_order`

---

### 4. Laundry Orders

**Main Table:** `laundry_orders`
**Junction Table:** `laundry_order_items`

**laundry_orders** structure:

- Foreign Keys:
  - `guest_id` → `guests.id`
  - `hotel_id` → `hotels.id`
  - `created_by` → `profiles.id` (nullable)
  - `updated_at_by` → `profiles.id` (nullable)

**Required Fields:**

- `hotel_id`, `guest_id`, `pickup_date`, `delivery_date`, `total_price`, `status`

**Optional Fields:**

- `pickup_time`, `delivery_time`, `special_instructions`, `created_by`, `updated_at_by`

**laundry_order_items** structure:

- Foreign Keys:
  - `order_id` → `laundry_orders.id`
  - `service_id` → `laundry_services.id`

**Required Fields:**

- `order_id`, `service_id`, `price_at_order`

**Optional Fields:**

- `quantity` (defaults to 1)

---

## Generator Functions

### Amenity Requests

```javascript
generateAmenityRequests(supabase, hotelId, guests, amenities, config);
// Returns: Array of amenity request objects
```

### Restaurant Orders

```javascript
generateRestaurantOrders(
  supabase,
  hotelId,
  guests,
  restaurants,
  menuItems,
  config
);
// Returns: { orders: Array, orderItems: Array }
// IMPORTANT: Filters menu items by restaurant_ids
```

### Shop Orders

```javascript
generateShopOrders(supabase, hotelId, guests, products, config);
// Returns: { orders: Array, orderItems: Array }
```

### Laundry Orders

```javascript
generateLaundryOrders(supabase, hotelId, guests, laundryServices, config);
// Returns: { orders: Array, orderItems: Array }
```

---

## Configuration Defaults

```javascript
{
  amenityRequests: { min: 2, max: 5 },    // per guest
  restaurantOrders: { min: 1, max: 3 },   // per guest
  shopOrders: { min: 0, max: 2 },         // per guest
  laundryOrders: { min: 0, max: 2 }       // per guest
}
```

---

## Expected Data Volume (1,236 guests)

- **Amenity Requests:** ~4,326 orders (avg 3.5 per guest)
- **Restaurant Orders:** ~2,472 orders + ~9,888 items (avg 2 orders, 4 items each)
- **Shop Orders:** ~1,236 orders + ~3,090 items (avg 1 order, 2.5 items each)
- **Laundry Orders:** ~1,236 orders + ~3,708 items (avg 1 order, 3 items each)

**Total Expected Records:** ~26,162 order-related records

---

## Status Values by Order Type

### Amenity Requests

- `pending`, `in_progress`, `completed`, `cancelled`

### Restaurant Orders

- `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`

### Shop Orders

- `pending`, `processing`, `ready`, `delivered`, `cancelled`

### Laundry Orders

- `pending`, `picked_up`, `in_progress`, `ready`, `delivered`, `cancelled`
