/**
 * Request History Types
 */

import type {
  AmenityRequestHistory,
  DineInOrderHistory,
  ShopOrderHistory,
  LaundryOrderHistory,
} from "../../../hooks/guest-management/request-history/useGuestRequestHistory";

export type {
  AmenityRequestHistory,
  DineInOrderHistory,
  ShopOrderHistory,
  LaundryOrderHistory,
};

export type RequestType = "amenity" | "restaurant" | "shop" | "laundry";

export interface LaundryOrderHistory {
  id: string;
  guest_id: string;
  hotel_id: string;
  total_price: number;
  pickup_date: string;
  pickup_time?: string | null;
  delivery_date: string;
  delivery_time?: string | null;
  special_instructions?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  services_data?: Array<{
    service: {
      id: string;
      category: string;
      description: string;
    } | null;
    quantity: number;
    price_at_order: number;
  }>;
}

export interface GroupedRequest {
  date: string;
  items: RequestHistoryItem[];
}

export interface RequestHistoryItem {
  id: string;
  type: RequestType;
  title: string;
  subtitle: string;
  items: Array<{
    name: string;
    quantity?: number;
    imageUrl?: string | null;
  }>;
  total: number;
  status: string;
  createdAt: string;
  deliveryInfo?: string;
  notes?: string | null;
  data:
    | AmenityRequestHistory
    | DineInOrderHistory
    | ShopOrderHistory
    | LaundryOrderHistory;
}
