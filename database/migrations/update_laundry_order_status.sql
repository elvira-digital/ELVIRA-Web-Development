-- Migration: Add 'picked_up' status to laundry_orders
-- Description: Updates the status CHECK constraint to include 'picked_up' status between 'confirmed' and 'in_progress'
-- Date: 2024

-- Step 1: Drop the existing CHECK constraint
ALTER TABLE laundry_orders 
DROP CONSTRAINT IF EXISTS laundry_orders_status_check;

-- Step 2: Add the new CHECK constraint with 'picked_up' status
ALTER TABLE laundry_orders 
ADD CONSTRAINT laundry_orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'picked_up', 'in_progress', 'ready', 'delivered', 'cancelled'));

-- Note: This migration is safe to run on existing data as it only expands the allowed values
-- Any existing orders with current status values will remain valid
