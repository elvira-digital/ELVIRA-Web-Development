-- Check guest expiration dates to verify they're in the future
-- This helps debug JWT expiration issues

SELECT 
  room_number,
  guest_name,
  access_code_expires_at,
  access_code_expires_at::timestamp > NOW() as is_valid,
  EXTRACT(EPOCH FROM (access_code_expires_at::timestamp - NOW())) / 86400 as days_until_expiry,
  created_at,
  is_active
FROM guests
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5'
ORDER BY access_code_expires_at ASC
LIMIT 20;

-- Summary: How many guests have expired vs valid tokens
SELECT 
  CASE 
    WHEN access_code_expires_at::timestamp > NOW() THEN 'Valid (Future)'
    ELSE 'Expired (Past)'
  END as token_status,
  COUNT(*) as guest_count
FROM guests
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5'
GROUP BY token_status;
