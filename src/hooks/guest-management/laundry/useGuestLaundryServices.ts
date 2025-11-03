import { useQuery } from "@tanstack/react-query";
import { getGuestSupabaseClient } from "../../../services/guestSupabase";
import { useGuestRealtimeSubscription } from "../../realtime/useGuestRealtimeSubscription";
import type { Database } from "../../../types/database";

type LaundryService = Database["public"]["Tables"]["laundry_services"]["Row"];

const GUEST_LAUNDRY_SERVICES_QUERY_KEY = "guest-laundry-services";

/**
 * Fetch active laundry services for guests
 * Only returns items where is_active = true
 * Includes real-time subscription for live updates
 */
export function useGuestLaundryServices(hotelId: string | undefined) {
  const query = useQuery<LaundryService[]>({
    queryKey: [GUEST_LAUNDRY_SERVICES_QUERY_KEY, hotelId],
    queryFn: async () => {
      if (!hotelId) return [];

      const guestSupabase = getGuestSupabaseClient();

      const { data, error } = await guestSupabase
        .from("laundry_services")
        .select("*")
        .eq("hotel_id", hotelId)
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("description", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!hotelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Real-time subscription for live updates
  useGuestRealtimeSubscription({
    table: "laundry_services",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: [GUEST_LAUNDRY_SERVICES_QUERY_KEY, hotelId],
    enabled: !!hotelId,
  });

  return query;
}

/**
 * Fetch active laundry services by category for guests
 * Only returns items where is_active = true
 */
export function useGuestLaundryServicesByCategory(
  hotelId: string | undefined,
  category: string | undefined
) {
  return useQuery<LaundryService[]>({
    queryKey: [GUEST_LAUNDRY_SERVICES_QUERY_KEY, hotelId, "category", category],
    queryFn: async () => {
      if (!hotelId || !category) return [];

      const guestSupabase = getGuestSupabaseClient();

      const { data, error } = await guestSupabase
        .from("laundry_services")
        .select("*")
        .eq("hotel_id", hotelId)
        .eq("category", category)
        .eq("is_active", true)
        .order("description", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!hotelId && !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
