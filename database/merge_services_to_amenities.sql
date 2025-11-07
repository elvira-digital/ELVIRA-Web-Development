-- Merge 'services' section data into 'amenities'
-- This will consolidate duplicate tracking data

-- Update guest_analytics_interactions
UPDATE guest_analytics_interactions
SET section_type = 'amenities'
WHERE section_type = 'services';

-- Update guest_section_sessions
UPDATE guest_section_sessions
SET section_type = 'amenities'
WHERE section_type = 'services';

-- Verify the changes
SELECT 
  section_type, 
  COUNT(*) as count,
  COUNT(DISTINCT guest_id) as unique_guests
FROM guest_analytics_interactions
GROUP BY section_type
ORDER BY section_type;
