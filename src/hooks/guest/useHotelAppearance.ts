/**
 * Hook to fetch and subscribe to hotel appearance settings
 * Uses real-time subscription to update when settings change
 */

import { useQuery } from "@tanstack/react-query";
import { getGuestSupabaseClient } from "../../services/guestSupabase";
import { useEffect } from "react";
import type { Database } from "../../types/database";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type HotelAppearanceSettings =
  Database["public"]["Tables"]["hotel_appearance_settings"]["Row"];

export function useHotelAppearance(hotelId: string | undefined) {
  const supabase = getGuestSupabaseClient();

  const query = useQuery({
    queryKey: ["hotel-appearance-settings", hotelId],
    queryFn: async () => {
      if (!hotelId) {
        throw new Error("Hotel ID is required");
      }

      const { data, error } = await supabase
        .from("hotel_appearance_settings")
        .select("*")
        .eq("hotel_id", hotelId)
        .single();

      if (error) {
        console.error("Error fetching hotel appearance settings:", error);
        throw error;
      }

      return data as HotelAppearanceSettings;
    },
    enabled: !!hotelId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!hotelId) return;

    const channel = supabase
      .channel(`hotel-appearance-${hotelId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "*",
          schema: "public",
          table: "hotel_appearance_settings",
          filter: `hotel_id=eq.${hotelId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          console.log("🎨 Hotel appearance settings updated:", payload.new);
          // Invalidate and refetch when settings change
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hotelId, supabase, query]);

  return query;
}
