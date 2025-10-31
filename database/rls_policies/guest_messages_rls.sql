-- ============================================================================
-- Guest Messages RLS Policies
-- ============================================================================
-- Allows guests to:
-- 1. SELECT (read) messages in their own conversations
-- 2. INSERT (send) messages to their own conversations
-- 3. UPDATE (mark as read) messages sent TO them by hotel staff
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Guests can read their own conversation messages" ON guest_messages;
DROP POLICY IF EXISTS "Guests can insert messages to their conversations" ON guest_messages;
DROP POLICY IF EXISTS "Guests can mark received messages as read" ON guest_messages;

-- ============================================================================
-- SELECT Policy - Guests can read messages in their own conversations
-- ============================================================================
CREATE POLICY "Guests can read their own conversation messages"
ON guest_messages
FOR SELECT
TO authenticated
USING (
  -- Must be a guest user
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  -- Message must be in a conversation belonging to this guest
  EXISTS (
    SELECT 1 FROM guest_conversation
    WHERE guest_conversation.id = guest_messages.conversation_id
    AND guest_conversation.guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid
    AND guest_conversation.hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid
  )
);

-- ============================================================================
-- INSERT Policy - Guests can send messages to their own conversations
-- ============================================================================
CREATE POLICY "Guests can insert messages to their conversations"
ON guest_messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- Must be a guest user
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  -- Message must be in a conversation belonging to this guest
  EXISTS (
    SELECT 1 FROM guest_conversation
    WHERE guest_conversation.id = guest_messages.conversation_id
    AND guest_conversation.guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid
    AND guest_conversation.hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid
  ) AND
  -- Message must be sent by the guest (sender_type must be 'guest')
  sender_type = 'guest'::text
);

-- ============================================================================
-- UPDATE Policy - Guests can mark messages as read
-- ============================================================================
CREATE POLICY "Guests can mark received messages as read"
ON guest_messages
FOR UPDATE
TO authenticated
USING (
  -- Must be a guest user
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  -- Message must be in a conversation belonging to this guest
  EXISTS (
    SELECT 1 FROM guest_conversation
    WHERE guest_conversation.id = guest_messages.conversation_id
    AND guest_conversation.guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid
    AND guest_conversation.hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid
  ) AND
  -- Can only update messages sent BY hotel staff TO the guest
  sender_type = 'hotel_staff'::text
)
WITH CHECK (
  -- Must be a guest user
  ((auth.jwt() ->> 'user_role'::text) = 'guest'::text) AND
  -- Message must be in a conversation belonging to this guest
  EXISTS (
    SELECT 1 FROM guest_conversation
    WHERE guest_conversation.id = guest_messages.conversation_id
    AND guest_conversation.guest_id = ((auth.jwt() ->> 'guest_id'::text))::uuid
    AND guest_conversation.hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid
  ) AND
  -- Can only update messages sent BY hotel staff TO the guest
  sender_type = 'hotel_staff'::text AND
  -- Can only modify the is_read field (prevent changing message content)
  -- Note: This is enforced at application level by only updating is_read field
  is_read = true
);

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these queries after applying the policies to verify they work:

-- 1. Check if policies were created successfully
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'guest_messages'
-- ORDER BY policyname;

-- 2. Test as guest user (replace with actual guest_id and conversation_id)
-- SELECT * FROM guest_messages 
-- WHERE conversation_id = 'your-conversation-id';

-- 3. Test marking message as read
-- UPDATE guest_messages 
-- SET is_read = true 
-- WHERE conversation_id = 'your-conversation-id' 
-- AND sender_type = 'hotel_staff' 
-- AND is_read = false;
