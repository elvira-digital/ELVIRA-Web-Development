-- Compare how hashes are stored for fake vs real guests
-- Check if hashed_verification_code matches between guests and guest_personal_data

SELECT 
  g.id,
  g.room_number,
  g.guest_name,
  g.hashed_verification_code as guest_hash,
  gpd.hashed_verification_code as personal_data_hash,
  g.hashed_verification_code = gpd.hashed_verification_code as hashes_match,
  g.created_at,
  g.is_active,
  LENGTH(g.hashed_verification_code) as hash_length
FROM guests g
LEFT JOIN guest_personal_data gpd ON g.id = gpd.guest_id
WHERE g.hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5'
ORDER BY g.created_at DESC
LIMIT 10;

-- Check if any guests have NULL or empty hashes
SELECT 
  COUNT(*) as total_guests,
  COUNT(CASE WHEN hashed_verification_code IS NULL THEN 1 END) as null_hashes,
  COUNT(CASE WHEN hashed_verification_code = '' THEN 1 END) as empty_hashes,
  COUNT(CASE WHEN hashed_verification_code IS NOT NULL AND hashed_verification_code != '' THEN 1 END) as valid_hashes
FROM guests
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5';
