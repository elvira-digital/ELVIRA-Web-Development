# Laundry Order Status Fix

## Issue

The `laundry_orders` table had a mismatch between the frontend status values and the database CHECK constraint.

### Database Schema (Before Fix)

The database allowed only **6 status values**:

- `pending`
- `confirmed`
- `in_progress`
- `ready`
- `delivered`
- `cancelled`

### Frontend Implementation

The frontend uses **7 status values**:

- `pending`
- `confirmed`
- **`picked_up`** ⚠️ **MISSING IN DATABASE**
- `in_progress`
- `ready`
- `delivered`
- `cancelled`

### Impact

This mismatch would cause a **database constraint violation** when staff tried to update an order to `picked_up` status from the UI, resulting in failed status updates and a broken workflow.

## Files Affected

### Frontend Files Using Status

1. **`src/screens/hotel/hotel-laundry/orders/components/laundry-order-modal/OrderInfoSection.tsx`**

   - Line 30: Includes `"picked_up"` in status options
   - Status dropdown in order details modal

2. **`src/screens/hotel/hotel-laundry/orders/components/LaundryOrdersTable.tsx`**
   - Line 63: Includes `"picked_up"` in status options
   - Status badge in orders table

### Database Files Updated

1. **`database/migrations/009_create_laundry_orders.sql`**

   - Updated CHECK constraint to include `'picked_up'`
   - Line 13: Added `'picked_up'` between `'confirmed'` and `'in_progress'`

2. **`database/migrations/update_laundry_order_status.sql`** (NEW)
   - Migration to update existing databases
   - Drops old constraint and adds new one with `'picked_up'`

## Solution

### Updated Status Flow

The complete laundry order workflow now supports these statuses in order:

1. **`pending`** - Initial state when guest creates order
2. **`confirmed`** - Hotel staff confirms the order
3. **`picked_up`** - Laundry has been collected from guest room ⭐ **ADDED**
4. **`in_progress`** - Laundry is being processed
5. **`ready`** - Laundry is clean and ready for delivery
6. **`delivered`** - Laundry has been returned to guest
7. **`cancelled`** - Order was cancelled (can happen at any stage)

### Database Changes

#### Updated Migration File

File: `database/migrations/009_create_laundry_orders.sql`

```sql
status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'confirmed', 'picked_up', 'in_progress', 'ready', 'delivered', 'cancelled'))
```

#### New Migration Script

File: `database/migrations/update_laundry_order_status.sql`

This script updates existing databases by:

1. Dropping the old CHECK constraint
2. Adding the new CHECK constraint with `'picked_up'` included

## How to Apply

### For New Databases

Run the updated `009_create_laundry_orders.sql` migration file.

### For Existing Databases

Run the new `update_laundry_order_status.sql` migration:

```bash
# Using Supabase CLI
supabase db execute database/migrations/update_laundry_order_status.sql

# Or manually in Supabase SQL Editor
# Copy and paste the contents of update_laundry_order_status.sql
```

## Testing

After applying the migration, verify:

1. ✅ Can create new laundry orders
2. ✅ Can update order status to `picked_up`
3. ✅ Can transition through all status values
4. ✅ Status badge displays correctly in orders table
5. ✅ Status dropdown in order modal shows all 7 options
6. ✅ No database constraint errors when updating status

## Notes

- This is a **safe migration** - it only expands allowed values, doesn't restrict existing data
- Existing orders with current status values remain valid
- The `picked_up` status provides better tracking of the laundry collection process
- Frontend already implemented this status - we're just catching up the database schema
