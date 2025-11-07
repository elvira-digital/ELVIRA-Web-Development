import { faker } from "@faker-js/faker";

const STATUSES = [
  "pending",
  "picked_up",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
];
const TIMES = [
  "08:00",
  "08:30",
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
];

/**
 * Generate laundry orders with order items for guests
 * @param {Object} supabase - Supabase client
 * @param {string} hotelId - Hotel ID
 * @param {Array} guests - Array of guest objects with { id, check_in_date, checkout_date }
 * @param {Array} laundryServices - Array of available laundry services with { id, category, price }
 * @param {Object} config - Configuration { min: number, max: number }
 * @returns {Promise<Object>} Object with { orders: Array, orderItems: Array }
 */
export async function generateLaundryOrders(
  supabase,
  hotelId,
  guests,
  laundryServices,
  config = { min: 0, max: 2 }
) {
  if (!laundryServices || laundryServices.length === 0) {
    console.log(
      "⚠️  No laundry services available, skipping laundry order generation"
    );
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
      // Generate pickup date within stay period (not last day)
      const maxPickupDay = Math.max(0, stayDuration - 2); // Leave time for delivery
      const pickupDayOffset = faker.number.int({ min: 0, max: maxPickupDay });
      const pickupDate = new Date(checkIn);
      pickupDate.setDate(pickupDate.getDate() + pickupDayOffset);

      // Delivery is typically 24-48 hours after pickup
      const deliveryDate = new Date(pickupDate);
      deliveryDate.setDate(
        deliveryDate.getDate() + faker.number.int({ min: 1, max: 2 })
      );

      // Make sure delivery is before checkout
      if (deliveryDate >= checkOut) {
        deliveryDate.setDate(checkOut.getDate() - 1);
      }

      const now = new Date();
      let status;

      if (deliveryDate < now) {
        // Orders with past delivery are mostly delivered
        status = faker.helpers.weightedArrayElement([
          { value: "delivered", weight: 85 },
          { value: "cancelled", weight: 10 },
          { value: "ready", weight: 5 },
        ]);
      } else if (pickupDate < now && deliveryDate >= now) {
        // Picked up but not delivered yet
        status = faker.helpers.weightedArrayElement([
          { value: "in_progress", weight: 60 },
          { value: "ready", weight: 30 },
          { value: "picked_up", weight: 10 },
        ]);
      } else {
        // Future pickups
        status = faker.helpers.weightedArrayElement([
          { value: "pending", weight: 80 },
          { value: "cancelled", weight: 20 },
        ]);
      }

      // Generate order ID first
      const orderId = faker.string.uuid();

      // Select 1-5 laundry services for this order
      const itemCount = faker.number.int({ min: 1, max: 5 });
      const selectedServices = faker.helpers.arrayElements(
        laundryServices,
        Math.min(itemCount, laundryServices.length)
      );

      let totalPrice = 0;

      // Create order items
      for (const service of selectedServices) {
        const quantity = faker.number.int({ min: 1, max: 8 }); // Number of items (shirts, pants, etc.)
        const priceAtOrder = service.price;
        const itemTotal = priceAtOrder * quantity;
        totalPrice += itemTotal;

        orderItems.push({
          order_id: orderId,
          service_id: service.id,
          quantity,
          price_at_order: priceAtOrder,
        });
      }

      // Special instructions (25% chance)
      const hasInstructions = faker.datatype.boolean({ probability: 0.25 });
      const specialInstructions = hasInstructions
        ? faker.helpers.arrayElement([
            "Handle with care - delicate fabric",
            "No starch please",
            "Extra starch",
            "Rush service needed",
            "Hang dry only",
            "Fold neatly",
            "Urgent - needed by tomorrow",
            null,
          ])
        : null;

      orders.push({
        id: orderId,
        hotel_id: hotelId,
        guest_id: guest.id,
        pickup_date: pickupDate.toISOString().split("T")[0],
        pickup_time: faker.helpers.arrayElement(TIMES),
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
