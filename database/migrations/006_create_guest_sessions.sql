-- Add session_id to guests table to link multiple guests together
-- Multiple guests with the same session_id = same room booking
-- Each guest still has their own hashed_verification_code for individual login

DO $$ 
BEGIN
  -- Add session_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE guests ADD COLUMN session_id TEXT;
    CREATE INDEX idx_guests_session_id ON guests(hotel_id, session_id);
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN guests.session_id IS 'Links multiple guests to the same room booking. All guests with the same session_id share the same room but each has their own hashed_verification_code for individual login.';
COMMENT ON COLUMN guests.room_number IS 'The room number for this booking/session';
COMMENT ON COLUMN guests.hashed_verification_code IS 'Hashed 6-digit access code for individual guest authentication (use hash_verification_code RPC function to set)';
COMMENT ON COLUMN guests.access_code_expire_at IS 'Expiration timestamp for the guest access code (typically checkout date)';
COMMENT ON COLUMN guests.is_active IS 'Whether this guest account is currently active';


