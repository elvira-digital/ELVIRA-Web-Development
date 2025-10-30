import { supabase } from "../supabase";

/**
 * Fetch hotel coordinates from the database
 * Used as a fallback when hotelData doesn't include coordinates
 */
export async function fetchHotelCoordinates(hotelId: string): Promise<{
  latitude: number | null;
  longitude: number | null;
}> {
  try {
    const { data, error } = await supabase
      .from("hotels")
      .select("latitude, longitude")
      .eq("id", hotelId)
      .single();

    if (error) {
      console.error("Error fetching hotel coordinates:", error);
      return { latitude: null, longitude: null };
    }

    return {
      latitude: data?.latitude || null,
      longitude: data?.longitude || null,
    };
  } catch (error) {
    console.error("Exception fetching hotel coordinates:", error);
    return { latitude: null, longitude: null };
  }
}
