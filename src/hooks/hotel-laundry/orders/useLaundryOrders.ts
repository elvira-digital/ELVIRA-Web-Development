import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../services/supabase";
import { useOptimizedQuery } from "../../api/useOptimizedQuery";
import { useRealtimeSubscription } from "../../realtime/useRealtimeSubscription";
import type { Database } from "../../../types/database";

type LaundryOrder = Database["public"]["Tables"]["laundry_orders"]["Row"];
type LaundryOrderInsert =
  Database["public"]["Tables"]["laundry_orders"]["Insert"];
type LaundryOrderUpdate =
  Database["public"]["Tables"]["laundry_orders"]["Update"];
type LaundryOrderItem =
  Database["public"]["Tables"]["laundry_order_items"]["Row"];

const LAUNDRY_ORDERS_QUERY_KEY = "laundry-orders";

export interface LaundryOrderWithDetails extends LaundryOrder {
  guests: {
    id: string;
    guest_name: string;
    room_number: string;
  } | null;
  laundry_order_items: Array<
    LaundryOrderItem & {
      laundry_services: {
        id: string;
        category: string;
        description: string;
      } | null;
    }
  >;
}

/**
 * Fetch laundry orders for a specific hotel
 */
export function useLaundryOrders(hotelId: string | undefined) {
  const query = useOptimizedQuery<LaundryOrderWithDetails[]>({
    queryKey: [LAUNDRY_ORDERS_QUERY_KEY, hotelId],
    queryFn: async () => {
      if (!hotelId) return [];

      const { data, error } = await supabase
        .from("laundry_orders")
        .select(
          `
          *,
          guests (
            id,
            guest_name,
            room_number
          ),
          laundry_order_items (
            *,
            laundry_services (
              id,
              category,
              description
            )
          )
        `
        )
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LaundryOrderWithDetails[];
    },
    enabled: !!hotelId,
    config: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000,
    },
  });

  // Real-time subscription
  useRealtimeSubscription({
    table: "laundry_orders",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: [LAUNDRY_ORDERS_QUERY_KEY, hotelId],
    enabled: !!hotelId,
  });

  return query;
}

/**
 * Fetch orders for the current hotel
 */
export function useCurrentHotelLaundryOrders() {
  const [hotelId, setHotelId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getHotelId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (profile) {
          const { data: hotel } = await supabase
            .from("hotels")
            .select("id")
            .eq("owner_id", profile.id)
            .single();

          if (hotel) {
            setHotelId(hotel.id);
          }
        }
      }
    };

    getHotelId();
  }, []);

  return useLaundryOrders(hotelId);
}

/**
 * Fetch orders by status
 */
export function useLaundryOrdersByStatus(
  hotelId: string | undefined,
  status: string | undefined
) {
  return useOptimizedQuery<LaundryOrderWithDetails[]>({
    queryKey: [LAUNDRY_ORDERS_QUERY_KEY, hotelId, "status", status],
    queryFn: async () => {
      if (!hotelId || !status) return [];

      const { data, error } = await supabase
        .from("laundry_orders")
        .select(
          `
          *,
          guests (
            id,
            guest_name,
            room_number
          ),
          laundry_order_items (
            *,
            laundry_services (
              id,
              category,
              description
            )
          )
        `
        )
        .eq("hotel_id", hotelId)
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LaundryOrderWithDetails[];
    },
    enabled: !!hotelId && !!status,
    config: {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  });
}

/**
 * Create a new order with items
 */
export function useCreateLaundryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: LaundryOrderInsert;
      items: Array<{
        service_id: string;
        quantity: number;
        price_at_order: number;
      }>;
    }) => {
      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("laundry_orders")
        .insert(order)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        service_id: item.service_id,
        quantity: item.quantity,
        price_at_order: item.price_at_order,
      }));

      const { error: itemsError } = await supabase
        .from("laundry_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData;
    },
    onSuccess: (data: LaundryOrder) => {
      queryClient.invalidateQueries({
        queryKey: [LAUNDRY_ORDERS_QUERY_KEY, data.hotel_id],
      });
    },
  });
}

/**
 * Update an order
 */
export function useUpdateLaundryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: LaundryOrderUpdate;
    }) => {
      const { data, error } = await supabase
        .from("laundry_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: LaundryOrder) => {
      queryClient.invalidateQueries({
        queryKey: [LAUNDRY_ORDERS_QUERY_KEY, data.hotel_id],
      });
    },
  });
}

/**
 * Update order status
 */
export function useUpdateLaundryOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("laundry_orders")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: LaundryOrder) => {
      queryClient.invalidateQueries({
        queryKey: [LAUNDRY_ORDERS_QUERY_KEY, data.hotel_id],
      });
    },
  });
}

/**
 * Delete an order
 */
export function useDeleteLaundryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hotelId }: { id: string; hotelId: string }) => {
      const { error } = await supabase
        .from("laundry_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, hotelId };
    },
    onSuccess: (data: { id: string; hotelId: string }) => {
      queryClient.invalidateQueries({
        queryKey: [LAUNDRY_ORDERS_QUERY_KEY, data.hotelId],
      });
    },
  });
}
