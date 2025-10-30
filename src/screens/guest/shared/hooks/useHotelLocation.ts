import { useMemo } from "react";

interface HotelData {
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  lon?: number | null;
  [key: string]: unknown;
}

/**
 * Extract hotel location from hotel data
 * Returns null if coordinates are not available
 */
export const useHotelLocation = (
  hotelData?: HotelData | null
): { lat: number; lng: number } | null => {
  return useMemo(() => {
    if (!hotelData) {
      return null;
    }

    const lat = hotelData.latitude || hotelData.lat;
    const lng = hotelData.longitude || hotelData.lng || hotelData.lon;

    // Only return coordinates if both are valid
    if (!lat || !lng) {
      return null;
    }

    return { lat, lng };
  }, [hotelData]);
};
