-- Query to check valid status values for amenity_requests table
-- Run this in Supabase SQL Editor

SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'amenity_requests' 
AND con.contype = 'c';
