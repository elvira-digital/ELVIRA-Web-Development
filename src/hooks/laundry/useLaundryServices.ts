import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabase";
import type { Database } from "../../types/database";

type LaundryService = Database["public"]["Tables"]["laundry_services"]["Row"];
type LaundryServiceInsert =
  Database["public"]["Tables"]["laundry_services"]["Insert"];
type LaundryServiceUpdate =
  Database["public"]["Tables"]["laundry_services"]["Update"];

// Fetch all laundry services for a hotel
export function useLaundryServices(hotelId: string | undefined) {
  return useQuery({
    queryKey: ["laundry-services", hotelId],
    queryFn: async () => {
      if (!hotelId) throw new Error("Hotel ID is required");

      const { data, error } = await supabase
        .from("laundry_services")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("category", { ascending: true });

      if (error) throw error;
      return data as LaundryService[];
    },
    enabled: !!hotelId,
  });
}

// Create a new laundry service
export function useCreateLaundryService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: LaundryServiceInsert) => {
      const { data, error } = await supabase
        .from("laundry_services")
        .insert(service)
        .select()
        .single();

      if (error) throw error;
      return data as LaundryService;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["laundry-services", variables.hotel_id],
      });
    },
  });
}

// Update a laundry service
export function useUpdateLaundryService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      hotelId,
      updates,
    }: {
      id: string;
      hotelId: string;
      updates: LaundryServiceUpdate;
    }) => {
      const { data, error } = await supabase
        .from("laundry_services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LaundryService;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["laundry-services", variables.hotelId],
      });
    },
  });
}

// Delete a laundry service
export function useDeleteLaundryService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hotelId }: { id: string; hotelId: string }) => {
      const { error } = await supabase
        .from("laundry_services")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["laundry-services", variables.hotelId],
      });
    },
  });
}

// Update service status (active/inactive)
export function useUpdateLaundryServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      hotelId,
      isActive,
    }: {
      id: string;
      hotelId: string;
      isActive: boolean;
    }) => {
      const { data, error } = await supabase
        .from("laundry_services")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LaundryService;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["laundry-services", variables.hotelId],
      });
    },
  });
}
