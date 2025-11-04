/**
 * Hook to get pending notification counts for sidebar menu items
 * Tracks pending items from:
 * - Guest messages (chat-management)
 * - Staff messages (chat-management)
 * - Amenity requests (amenities)
 * - Restaurant orders (hotel-restaurant)
 * - Shop orders (hotel-shop)
 * - Laundry orders (hotel-laundry)
 */

import { useOptimizedQuery } from "../api/useOptimizedQuery";
import { supabase } from "../../services/supabase";
import { useRealtimeSubscription } from "../realtime/useRealtimeSubscription";

export interface PendingNotifications {
  chatManagement: number; // guest_messages + staff_messages with unread or pending
  amenities: number; // amenity_requests with status 'pending'
  restaurant: number; // dine_in_orders with status 'pending'
  shop: number; // shop_orders with status 'pending'
  laundry: number; // laundry_orders with status 'pending'
  total: number;
}

interface NotificationCounts {
  [key: string]: number;
}

async function fetchPendingNotifications(
  hotelId: string | undefined
): Promise<PendingNotifications> {
  if (!hotelId) {
    return {
      chatManagement: 0,
      amenities: 0,
      restaurant: 0,
      shop: 0,
      laundry: 0,
      total: 0,
    };
  }

  const counts: NotificationCounts = {
    chatManagement: 0,
    amenities: 0,
    restaurant: 0,
    shop: 0,
    laundry: 0,
  };

  try {
    // Fetch pending guest messages (unread by staff)
    const { count: guestMessageCount } = await supabase
      .from("guest_messages")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("sender_type", "guest")
      .eq("read_by_staff", false);

    counts.chatManagement += guestMessageCount || 0;

    // Fetch pending staff messages (unread)
    const { count: staffMessageCount } = await supabase
      .from("staff_messages")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("is_read", false);

    counts.chatManagement += staffMessageCount || 0;

    // Fetch pending amenity requests
    const { count: amenityCount } = await supabase
      .from("amenity_requests")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("status", "pending");

    counts.amenities = amenityCount || 0;

    // Fetch pending restaurant orders (dine_in_orders)
    const { count: restaurantCount } = await supabase
      .from("dine_in_orders")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("status", "pending");

    counts.restaurant = restaurantCount || 0;

    // Fetch pending shop orders
    const { count: shopCount } = await supabase
      .from("shop_orders")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("status", "pending");

    counts.shop = shopCount || 0;

    // Fetch pending laundry orders
    const { count: laundryCount } = await supabase
      .from("laundry_orders" as any)
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("status", "pending");

    counts.laundry = laundryCount || 0;
  } catch (error) {
    console.error("Error fetching pending notifications:", error);
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return {
    chatManagement: counts.chatManagement,
    amenities: counts.amenities,
    restaurant: counts.restaurant,
    shop: counts.shop,
    laundry: counts.laundry,
    total,
  };
}

export function usePendingNotifications(hotelId: string | undefined) {
  const query = useOptimizedQuery<PendingNotifications>({
    queryKey: ["pending-notifications", hotelId],
    queryFn: () => fetchPendingNotifications(hotelId),
    enabled: !!hotelId,
    config: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 60 * 1000, // 1 minute
      refetchInterval: 60 * 1000, // Refetch every minute
    },
  });

  // Real-time subscriptions for all relevant tables
  const refetchNotifications = () => query.refetch();

  useRealtimeSubscription({
    table: "guest_messages",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: ["pending-notifications", hotelId],
    enabled: !!hotelId,
    onInsert: refetchNotifications,
    onUpdate: refetchNotifications,
    onDelete: refetchNotifications,
  });

  useRealtimeSubscription({
    table: "staff_messages",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: ["pending-notifications", hotelId],
    enabled: !!hotelId,
    onInsert: refetchNotifications,
    onUpdate: refetchNotifications,
    onDelete: refetchNotifications,
  });

  useRealtimeSubscription({
    table: "amenity_requests",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: ["pending-notifications", hotelId],
    enabled: !!hotelId,
    onInsert: refetchNotifications,
    onUpdate: refetchNotifications,
    onDelete: refetchNotifications,
  });

  useRealtimeSubscription({
    table: "dine_in_orders",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: ["pending-notifications", hotelId],
    enabled: !!hotelId,
    onInsert: refetchNotifications,
    onUpdate: refetchNotifications,
    onDelete: refetchNotifications,
  });

  useRealtimeSubscription({
    table: "shop_orders",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: ["pending-notifications", hotelId],
    enabled: !!hotelId,
    onInsert: refetchNotifications,
    onUpdate: refetchNotifications,
    onDelete: refetchNotifications,
  });

  useRealtimeSubscription({
    table: "laundry_orders",
    filter: hotelId ? `hotel_id=eq.${hotelId}` : undefined,
    queryKey: ["pending-notifications", hotelId],
    enabled: !!hotelId,
    onInsert: refetchNotifications,
    onUpdate: refetchNotifications,
    onDelete: refetchNotifications,
  });

  return query;
}
