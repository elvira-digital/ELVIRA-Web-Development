/**
 * Shop Orders Service
 *
 * Handles shop order submissions to the database
 */

import { getGuestSupabaseClient } from "../guestSupabase";
import { getGuestSession } from "./guestAuth";

export interface CreateShopOrderData {
  items: Array<{ productId: string; quantity: number; priceAtOrder: number }>;
  deliveryDate: string;
  deliveryTime?: string;
  specialInstructions?: string;
}

/**
 * Create a new shop order with items
 */
export async function createShopOrder(
  data: CreateShopOrderData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getGuestSupabaseClient();
    const session = getGuestSession();

    console.log("=== CREATE SHOP ORDER DEBUG ===");
    console.log("Session:", session);
    console.log("Order data:", data);

    if (!session) {
      console.error("❌ No session found");
      return { success: false, error: "Not authenticated" };
    }

    // Calculate total price
    const totalPrice = data.items.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    );

    // Prepare order data with guest_id and hotel_id for RLS
    const orderData = {
      guest_id: session.guestData.id,
      hotel_id: session.guestData.hotel_id,
      total_price: totalPrice,
      delivery_date: data.deliveryDate,
      delivery_time: data.deliveryTime || null,
      special_instructions: data.specialInstructions || null,
      status: "pending",
    };

    console.log("📦 Order data to insert:", orderData);

    // Check current user and JWT
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("👤 Current user:", user);

    if (user) {
      // Try to get the JWT to see the claims
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();
      console.log(
        "🔑 JWT claims:",
        authSession?.access_token ? "Token exists" : "No token"
      );

      // Decode JWT to see claims (this is just for debugging)
      if (authSession?.access_token) {
        try {
          const base64Url = authSession.access_token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          const claims = JSON.parse(jsonPayload);
          console.log("📋 JWT Payload:", {
            user_role: claims.user_role,
            sub: claims.sub,
            email: claims.email,
          });
        } catch (e) {
          console.log("Could not decode JWT:", e);
        }
      }
    } else {
      console.log("⚠️ No authenticated user found");
    }

    // Insert shop order
    const { data: insertedOrder, error: orderError } = await supabase
      .from("shop_orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("❌ [ShopOrders] Error creating order:", orderError);
      console.error("Error code:", orderError.code);
      console.error("Error message:", orderError.message);
      console.error("Error details:", orderError.details);
      console.error("Error hint:", orderError.hint);
      return { success: false, error: orderError.message };
    }

    console.log("✅ Order created successfully:", insertedOrder);

    // Insert order items
    const orderItems = data.items.map((item) => ({
      order_id: insertedOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_order: item.priceAtOrder,
    }));

    console.log("📦 Order items to insert:", orderItems);

    const { error: itemsError } = await supabase
      .from("shop_order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("❌ [ShopOrders] Error creating order items:", itemsError);
      console.error("Error code:", itemsError.code);
      console.error("Error message:", itemsError.message);

      // Try to rollback by deleting the order
      await supabase.from("shop_orders").delete().eq("id", insertedOrder.id);

      return { success: false, error: itemsError.message };
    }

    console.log("✅ Order items created successfully");

    // Reduce stock quantity for each product (if not unlimited stock)
    console.log("📦 Reducing stock quantities...");
    for (const item of data.items) {
      // Fetch current product to check if it has limited stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity, is_unlimited_stock")
        .eq("id", item.productId)
        .single();

      if (productError) {
        console.warn(
          `⚠️ Could not fetch product ${item.productId}:`,
          productError
        );
        continue;
      }

      // Only reduce stock if it's not unlimited
      if (
        !product.is_unlimited_stock &&
        product.stock_quantity !== null &&
        product.stock_quantity > 0
      ) {
        const newQuantity = Math.max(0, product.stock_quantity - item.quantity);

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock_quantity: newQuantity })
          .eq("id", item.productId);

        if (updateError) {
          console.error(
            `❌ Error updating stock for product ${item.productId}:`,
            updateError
          );
        } else {
          console.log(
            `✅ Stock reduced for product ${item.productId}: ${product.stock_quantity} → ${newQuantity}`
          );
        }
      }
    }

    console.log("=== END DEBUG ===");

    return { success: true };
  } catch (error) {
    console.error("💥 [ShopOrders] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Cancel a shop order (guest can only cancel their own pending orders)
 */
export async function cancelShopOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getGuestSupabaseClient();
    const session = getGuestSession();

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Update order status to cancelled
    const { error } = await supabase
      .from("shop_orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .eq("guest_id", session.guestData.id) // Ensure guest can only cancel their own orders
      .eq("status", "pending"); // Can only cancel pending orders

    if (error) {
      console.error("❌ [ShopOrders] Error cancelling order:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("💥 [ShopOrders] Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
