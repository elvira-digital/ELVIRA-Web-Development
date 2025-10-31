-- Fix border_radius values in hotel_appearance_settings
-- Replace invalid values (none, large) with proper CSS values

-- Update all 'none' values to '0px' (no border radius)
UPDATE hotel_appearance_settings
SET border_radius = '0px'
WHERE border_radius = 'none';

-- Update all 'large' values to '0.75rem' (12px - common rounded value)
UPDATE hotel_appearance_settings
SET border_radius = '0.75rem'
WHERE border_radius = 'large';

-- Optional: Add a check constraint to prevent invalid values in the future
-- Uncomment if you want to enforce valid CSS values:
/*
ALTER TABLE hotel_appearance_settings
DROP CONSTRAINT IF EXISTS valid_border_radius;

ALTER TABLE hotel_appearance_settings
ADD CONSTRAINT valid_border_radius
CHECK (border_radius ~ '^[0-9]+(\.[0-9]+)?(px|rem|em|%)$|^0$');
*/

-- Show updated values
SELECT hotel_id, border_radius 
FROM hotel_appearance_settings;
