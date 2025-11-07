# ELVIRA Test Data Generator

This tool generates realistic test data for stress testing the ELVIRA Hotel Management System.

## 📋 Prerequisites

1. Node.js installed
2. Supabase project set up
3. Environment variables configured in `../../.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Usage

### Phase 1: Generate Guests

Generate 500 rooms with 1,200+ guests:

```bash
npm run generate
```

This will create:

- 500 hotel rooms
- ~1,236 guests (families/couples sharing rooms)
- Guest personal data records
- Realistic check-in/checkout dates

**Note:** Only run this once! Running again will create MORE guests.

### Phase 2: Generate Orders

Generate orders for existing guests:

```bash
npm run generate:orders
```

This will create:

- Amenity requests (2-5 per guest)
- Restaurant orders with menu items (1-3 per guest)
- Shop orders with products (0-2 per guest)
- Laundry orders with services (0-2 per guest)

**Expected output:** ~26,000 total order-related records

**Safe to run multiple times** - Will generate new orders for existing guests.

## ⚙️ Configuration

Edit `config.js` to customize:

```javascript
{
  roomsCount: 500,           // Number of rooms to generate
  batchSize: 50,             // Database insert batch size

  orders: {
    amenityRequests: { min: 2, max: 5 },
    restaurantOrders: { min: 1, max: 3 },
    shopOrders: { min: 0, max: 2 },
    laundryOrders: { min: 0, max: 2 }
  }
}
```

## 📊 Data Volume

### Phase 1 (Guests)

- **Rooms:** 500
- **Guests:** ~1,236 (avg 2.47 per room)
- **Personal data:** ~1,236 records
- **Total:** ~2,472 records

### Phase 2 (Orders)

- **Amenity requests:** ~4,326 orders
- **Restaurant orders:** ~2,472 orders + ~9,888 items
- **Shop orders:** ~1,236 orders + ~3,090 items
- **Laundry orders:** ~1,236 orders + ~3,708 items
- **Total:** ~26,162 records

## 🗂️ File Structure

```
scripts/test-data/
├── index.js                    # Guest generation (Phase 1)
├── generate-orders.js          # Order generation (Phase 2)
├── config.js                   # Configuration settings
├── utils.js                    # Utility functions
├── package.json                # Dependencies
└── generators/
    ├── guests.js               # Guest data generator
    ├── amenity-requests.js     # Amenity requests generator
    ├── restaurant-orders.js    # Restaurant orders + items generator
    ├── shop-orders.js          # Shop orders + items generator
    └── laundry-orders.js       # Laundry orders + items generator
```

## 🔍 What Gets Generated

### Guests (Phase 1)

- ✅ Unique room numbers (100-999 range)
- ✅ Realistic names (using Faker.js)
- ✅ Valid verification codes (6-digit)
- ✅ Hashed codes (using database RPC)
- ✅ Family groupings (shared session_id, last names)
- ✅ Valid check-in/checkout dates (future expiration)
- ✅ Multiple countries and languages
- ✅ Phone numbers for primary guests

### Orders (Phase 2)

- ✅ Amenity requests with realistic statuses
- ✅ Restaurant orders with menu items matching restaurant
- ✅ Shop orders with products
- ✅ Laundry orders with services
- ✅ Realistic prices calculated from items
- ✅ Status based on order dates (past = delivered, future = pending)
- ✅ Order items with quantity and price_at_order
- ✅ Special instructions (random)

## 🎯 Use Cases

- **Performance Testing:** Test database performance with 26,000+ records
- **UI Testing:** Verify order lists, filters, pagination
- **Real-time Testing:** Test Supabase real-time subscriptions
- **Report Testing:** Generate analytics with realistic data
- **Search Testing:** Test search functionality with large datasets

## ⚠️ Important Notes

1. **Guest Generation:** Only run `npm run generate` ONCE to create guests
2. **Order Generation:** Safe to run `npm run generate:orders` multiple times
3. **Database Requirements:** Ensure amenities, restaurants, menu items, products, and laundry services exist before generating orders
4. **Service Role Key:** Required for bypassing RLS policies
5. **Performance:** Expect 2-5 minutes for full generation

## 🧹 Cleanup

To remove all test data:

```sql
-- Run in Supabase SQL Editor
DELETE FROM amenity_requests WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5';
DELETE FROM dine_in_order_items WHERE order_id IN (SELECT id FROM dine_in_orders WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5');
DELETE FROM dine_in_orders WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5';
DELETE FROM shop_order_items WHERE order_id IN (SELECT id FROM shop_orders WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5');
DELETE FROM shop_orders WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5';
DELETE FROM laundry_order_items WHERE order_id IN (SELECT id FROM laundry_orders WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5');
DELETE FROM laundry_orders WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5';
DELETE FROM guest_personal_data WHERE guest_id IN (SELECT id FROM guests WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5');
DELETE FROM guests WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5';
```

## 📝 Testing Credentials

After generation, check console output for test credentials:

- Room numbers
- Verification codes
- Use these to test guest authentication

## 🤝 Contributing

When adding new generators:

1. Create generator function in `generators/` folder
2. Export function following naming convention
3. Import and call in `generate-orders.js`
4. Update `config.js` with new settings
5. Document in this README
