import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabase";
import { useOptimizedQuery } from "../api/useOptimizedQuery";
import { useRealtimeSubscription } from "../realtime/useRealtimeSubscription";
import type { Database } from "../../types/database";

type Hotel = Database["public"]["Tables"]["hotels"]["Row"];
type HotelInsert = Database["public"]["Tables"]["hotels"]["Insert"];
type HotelUpdate = Database["public"]["Tables"]["hotels"]["Update"];

const HOTELS_QUERY_KEY = "elvira-hotels";

/**
 * Fetch all hotels for Elvira dashboard
 */
export function useHotels() {
  const query = useOptimizedQuery<Hotel[]>({
    queryKey: [HOTELS_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    config: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000,
    },
  });

  // Real-time subscription for hotels
  useRealtimeSubscription({
    table: "hotels",
    queryKey: [HOTELS_QUERY_KEY],
    enabled: true,
  });

  return query;
}

/**
 * Create a new hotel
 */
export function useCreateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotel: HotelInsert) => {
      const { data, error } = await supabase
        .from("hotels")
        .insert(hotel)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOTELS_QUERY_KEY] });
    },
  });
}

/**
 * Update an existing hotel
 */
export function useUpdateHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: HotelUpdate;
    }) => {
      const { data, error } = await supabase
        .from("hotels")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOTELS_QUERY_KEY] });
    },
  });
}

/**
 * Delete a hotel
 */
export function useDeleteHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hotels").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOTELS_QUERY_KEY] });
    },
  });
}
