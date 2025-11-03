-- Migration: Refactor guest session structure for multi-guest bookings
-- This migration ensures session_id and hashed_verification_code are properly set in guest_personal_data
-- Removes the unique constraint on (hotel_id, room_number) to allow multiple guests per room

BEGIN;

-- Step 1: Ensure guest_personal_data has session_id and hashed_verification_code columns
-- (These should already exist based on your schema, but adding IF NOT EXISTS for safety)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guest_personal_data' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE guest_personal_data ADD COLUMN session_id TEXT;
        RAISE NOTICE 'Added session_id column to guest_personal_data';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guest_personal_data' AND column_name = 'hashed_verification_code'
    ) THEN
        ALTER TABLE guest_personal_data ADD COLUMN hashed_verification_code TEXT;
        RAISE NOTICE 'Added hashed_verification_code column to guest_personal_data';
    END IF;
END $$;

-- Step 2: Drop the unique constraint on (hotel_id, room_number) in guests table
-- This allows multiple guests to share the same room
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'guests'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 2
    AND conkey @> ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'guests'::regclass AND attname = 'hotel_id'),
        (SELECT attnum FROM pg_attribute WHERE attrelid = 'guests'::regclass AND attname = 'room_number')
    ];

    -- Drop the constraint if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE guests DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped unique constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No unique constraint found on (hotel_id, room_number)';
    END IF;
END $$;

-- Step 3: Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_guests_session_id 
ON guests(session_id);

CREATE INDEX IF NOT EXISTS idx_guests_hotel_room_session 
ON guests(hotel_id, room_number, session_id);

CREATE INDEX IF NOT EXISTS idx_guest_personal_data_session_id 
ON guest_personal_data(session_id);

-- Step 4: Add unique constraint on (session_id, guest_email) to prevent duplicate emails in same session
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_personal_data_session_email 
ON guest_personal_data(session_id, guest_email) 
WHERE session_id IS NOT NULL;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN guests.session_id IS 'UUID linking all guests in the same booking together';
COMMENT ON COLUMN guest_personal_data.session_id IS 'UUID linking all guests in the same booking together';
COMMENT ON COLUMN guest_personal_data.hashed_verification_code IS 'Bcrypt hashed access code for individual guest authentication';
COMMENT ON INDEX idx_guests_session_id IS 'Fast lookup of all guests in a session';
COMMENT ON INDEX idx_guest_personal_data_session_id IS 'Fast lookup of personal data by session';
COMMENT ON INDEX idx_guest_personal_data_session_email IS 'Ensures unique email per guest within a session';

COMMIT;

-- Verification queries (run these separately after migration)
/*
-- Check session_id distribution
SELECT 
  session_id,
  COUNT(*) as guest_count,
  array_agg(guest_name) as guests,
  room_number
FROM guests
WHERE session_id IS NOT NULL
GROUP BY session_id, room_number
ORDER BY guest_count DESC
LIMIT 10;

-- Check for NULL session_ids
SELECT 
  COUNT(*) as total_guests,
  COUNT(session_id) as guests_with_session_id,
  COUNT(*) - COUNT(session_id) as guests_without_session_id
FROM guests;

-- Check guest_personal_data
SELECT 
  COUNT(*) as total_records,
  COUNT(session_id) as records_with_session_id,
  COUNT(hashed_verification_code) as records_with_hashed_code
FROM guest_personal_data;
*/
