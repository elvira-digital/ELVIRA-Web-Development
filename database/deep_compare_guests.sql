-- Deep comparison: Manual guest (Room 102) vs Generated guest (Room 922)
-- This will show EVERY field to find the difference

WITH manual_guest AS (
  SELECT * FROM guests WHERE room_number = '102' AND hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5'
),
generated_guest AS (
  SELECT * FROM guests WHERE room_number = '922' AND hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5' LIMIT 1
)
SELECT 
  'GUESTS TABLE COMPARISON' as comparison_type,
  'Manual (102)' as manual_room,
  'Generated (922)' as generated_room,
  '' as field_name,
  '' as manual_value,
  '' as generated_value,
  '' as match_status
UNION ALL
SELECT 
  'id',
  '102',
  '922',
  'id',
  m.id::text,
  g.id::text,
  CASE WHEN m.id = g.id THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'hotel_id',
  '102',
  '922',
  'hotel_id',
  m.hotel_id::text,
  g.hotel_id::text,
  CASE WHEN m.hotel_id = g.hotel_id THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'session_id',
  '102',
  '922',
  'session_id',
  COALESCE(m.session_id::text, 'NULL'),
  COALESCE(g.session_id::text, 'NULL'),
  CASE WHEN m.session_id = g.session_id OR (m.session_id IS NULL AND g.session_id IS NULL) THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'guest_name',
  '102',
  '922',
  'guest_name',
  m.guest_name,
  g.guest_name,
  CASE WHEN m.guest_name = g.guest_name THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'hash_length',
  '102',
  '922',
  'hashed_verification_code length',
  LENGTH(m.hashed_verification_code)::text,
  LENGTH(g.hashed_verification_code)::text,
  CASE WHEN LENGTH(m.hashed_verification_code) = LENGTH(g.hashed_verification_code) THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'hash_prefix',
  '102',
  '922',
  'hash starts with',
  LEFT(m.hashed_verification_code, 10),
  LEFT(g.hashed_verification_code, 10),
  CASE WHEN LEFT(m.hashed_verification_code, 10) = LEFT(g.hashed_verification_code, 10) THEN '✅' ELSE '⚠️' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'is_active',
  '102',
  '922',
  'is_active',
  m.is_active::text,
  g.is_active::text,
  CASE WHEN m.is_active = g.is_active THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'dnd_status',
  '102',
  '922',
  'dnd_status',
  m.dnd_status::text,
  g.dnd_status::text,
  CASE WHEN m.dnd_status = g.dnd_status THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'access_expires',
  '102',
  '922',
  'access_code_expires_at',
  m.access_code_expires_at::text,
  g.access_code_expires_at::text,
  CASE WHEN m.access_code_expires_at > NOW() AND g.access_code_expires_at > NOW() THEN '✅ Both future' ELSE '❌' END
FROM manual_guest m, generated_guest g
UNION ALL
SELECT 
  'created_by',
  '102',
  '922',
  'created_by',
  COALESCE(m.created_by::text, 'NULL'),
  COALESCE(g.created_by::text, 'NULL'),
  CASE WHEN m.created_by = g.created_by THEN '✅' ELSE '❌' END
FROM manual_guest m, generated_guest g;

-- Now check guest_personal_data
WITH manual_data AS (
  SELECT gpd.* 
  FROM guest_personal_data gpd
  JOIN guests g ON gpd.guest_id = g.id
  WHERE g.room_number = '102' AND g.hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5'
),
generated_data AS (
  SELECT gpd.* 
  FROM guest_personal_data gpd
  JOIN guests g ON gpd.guest_id = g.id
  WHERE g.room_number = '922' AND g.hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5'
  LIMIT 1
)
SELECT 
  'PERSONAL DATA COMPARISON' as comparison_type,
  'Manual (102)' as manual_room,
  'Generated (922)' as generated_room,
  '' as field_name,
  '' as manual_value,
  '' as generated_value,
  '' as match_status
UNION ALL
SELECT 
  'session_id',
  '102',
  '922',
  'session_id',
  COALESCE(m.session_id::text, 'NULL'),
  COALESCE(g.session_id::text, 'NULL'),
  CASE WHEN m.session_id = g.session_id OR (m.session_id IS NULL AND g.session_id IS NULL) THEN '✅' ELSE '❌' END
FROM manual_data m, generated_data g
UNION ALL
SELECT 
  'email',
  '102',
  '922',
  'guest_email',
  m.guest_email,
  g.guest_email,
  '✅'
FROM manual_data m, generated_data g
UNION ALL
SELECT 
  'language',
  '102',
  '922',
  'language',
  COALESCE(m.language, 'NULL'),
  COALESCE(g.language, 'NULL'),
  CASE WHEN m.language = g.language OR (m.language IS NULL AND g.language IS NULL) THEN '✅' ELSE '❌' END
FROM manual_data m, generated_data g
UNION ALL
SELECT 
  'country',
  '102',
  '922',
  'country',
  COALESCE(m.country, 'NULL'),
  COALESCE(g.country, 'NULL'),
  CASE WHEN m.country = g.country OR (m.country IS NULL AND g.country IS NULL) THEN '✅' ELSE '❌' END
FROM manual_data m, generated_data g
UNION ALL
SELECT 
  'phone',
  '102',
  '922',
  'phone_number',
  COALESCE(m.phone_number, 'NULL'),
  COALESCE(g.phone_number, 'NULL'),
  CASE WHEN m.phone_number IS NOT NULL AND g.phone_number IS NOT NULL THEN '✅ Both have phone' 
       WHEN m.phone_number IS NULL AND g.phone_number IS NULL THEN '✅ Both NULL'
       ELSE '❌ Different' END
FROM manual_data m, generated_data g
UNION ALL
SELECT 
  'hash_match',
  '102',
  '922',
  'hash matches guest table',
  LEFT(m.hashed_verification_code, 20),
  LEFT(g.hashed_verification_code, 20),
  '✅'
FROM manual_data m, generated_data g;
