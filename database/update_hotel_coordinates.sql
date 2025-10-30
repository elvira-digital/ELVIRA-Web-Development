-- Update Hotel Coordinates
-- This script updates the latitude and longitude for your hotel
-- Replace the coordinates with your hotel's actual location

-- For Centro Hotel Mondial in Munich, Germany
-- Coordinates: 48.1351° N, 11.5820° E

UPDATE hotels
SET 
  latitude = 48.1351,
  longitude = 11.5820
WHERE name = 'Centro Hotel Mondial';

-- If you need to find your hotel's coordinates:
-- 1. Go to Google Maps
-- 2. Search for your hotel address
-- 3. Right-click on the location pin
-- 4. Click "Copy coordinates" or look at the bottom of the screen
-- 5. Format: latitude, longitude (e.g., 48.1351, 11.5820)

-- To verify the update:
SELECT id, name, city, latitude, longitude
FROM hotels
WHERE name = 'Centro Hotel Mondial';
