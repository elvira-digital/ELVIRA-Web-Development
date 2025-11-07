import { faker } from "@faker-js/faker";

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "completed",
  "cancelled",
];
const TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];

/**
 * Generate shop orders with order items for guests
 * @param {Object} supabase - Supabase client
 * @param {string} hotelId - Hotel ID
 * @param {Array} guests - Array of guest objects with { id, check_in_date, checkout_date }
 * @param {Array} products - Array of available products with { id, name, price }
 * @param {Object} config - Configuration { min: number, max: number }
 * @returns {Promise<Object>} Object with { orders: Array, orderItems: Array }
 */
export async function generateShopOrders(
  supabase,
  hotelId,
  guests,
  products,
  config = { min: 0, max: 2 }
) {
  if (!products || products.length === 0) {
    console.log("⚠️  No products available, skipping shop order generation");
    return { orders: [], orderItems: [] };
  }

  const orders = [];
  const orderItems = [];

  for (const guest of guests) {
    const orderCount = faker.number.int({ min: config.min, max: config.max });
    const checkIn = new Date(guest.check_in_date);
    const checkOut = new Date(guest.checkout_date);
    const stayDuration = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < orderCount; i++) {
      // Generate order date within stay period
      const dayOffset = faker.number.int({
        min: 0,
        max: Math.max(0, stayDuration - 1),
      });
      const orderDate = new Date(checkIn);
      orderDate.setDate(orderDate.getDate() + dayOffset);

      // Delivery is typically 1-2 hours after order for in-hotel shop
      const deliveryDate = new Date(orderDate);
      deliveryDate.setHours(
        deliveryDate.getHours() + faker.number.int({ min: 1, max: 3 })
      );

      const now = new Date();
      let status;

      if (orderDate < now) {
        // Past orders are mostly delivered or completed
        status = faker.helpers.weightedArrayElement([
          { value: "delivered", weight: 70 },
          { value: "completed", weight: 15 },
          { value: "cancelled", weight: 10 },
          { value: "ready", weight: 5 },
        ]);
      } else {
        // Future orders are mostly pending or confirmed
        status = faker.helpers.weightedArrayElement([
          { value: "pending", weight: 60 },
          { value: "confirmed", weight: 25 },
          { value: "preparing", weight: 10 },
          { value: "cancelled", weight: 5 },
        ]);
      }

      // Generate order ID first
      const orderId = faker.string.uuid();

      // Select 1-4 products for this order
      const itemCount = faker.number.int({ min: 1, max: 4 });
      const selectedProducts = faker.helpers.arrayElements(products, itemCount);

      let totalPrice = 0;

      // Create order items
      for (const product of selectedProducts) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const priceAtOrder = product.price;
        const itemTotal = priceAtOrder * quantity;
        totalPrice += itemTotal;

        orderItems.push({
          order_id: orderId,
          product_id: product.id,
          quantity,
          price_at_order: priceAtOrder,
        });
      }

      // Special instructions (20% chance)
      const hasInstructions = faker.datatype.boolean({ probability: 0.2 });
      const specialInstructions = hasInstructions
        ? faker.helpers.arrayElement([
            "Gift wrap requested",
            "Deliver with care - fragile items",
            "Call before delivery",
            "Leave at door",
            "Priority delivery",
            null,
          ])
        : null;

      orders.push({
        id: orderId,
        hotel_id: hotelId,
        guest_id: guest.id,
        delivery_date: deliveryDate.toISOString().split("T")[0],
        delivery_time: faker.helpers.arrayElement(TIMES),
        total_price: parseFloat(totalPrice.toFixed(2)),
        status,
        special_instructions: specialInstructions,
      });
    }
  }

  return { orders, orderItems };
}
