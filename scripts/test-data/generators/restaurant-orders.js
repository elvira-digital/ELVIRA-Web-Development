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
const ORDER_TYPES = ["room_service", "restaurant_booking"];
const TIMES = [
  "07:00",
  "07:30",
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
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
];

const TABLE_PREFERENCES = [
  "Window seat",
  "Quiet area",
  "Near kitchen",
  "Outdoor seating",
  "Booth preferred",
  "Corner table",
  null,
];

/**
 * Generate restaurant orders with order items for guests
 * @param {Object} supabase - Supabase client
 * @param {string} hotelId - Hotel ID
 * @param {Array} guests - Array of guest objects with { id, check_in_date, checkout_date }
 * @param {Array} restaurants - Array of available restaurants with { id, name }
 * @param {Array} menuItems - Array of available menu items with { id, name, price, restaurant_ids }
 * @param {Object} config - Configuration { min: number, max: number }
 * @returns {Promise<Object>} Object with { orders: Array, orderItems: Array }
 */
export async function generateRestaurantOrders(
  supabase,
  hotelId,
  guests,
  restaurants,
  menuItems,
  config = { min: 1, max: 3 }
) {
  if (!restaurants || restaurants.length === 0) {
    console.log(
      "⚠️  No restaurants available, skipping restaurant order generation"
    );
    return { orders: [], orderItems: [] };
  }

  if (!menuItems || menuItems.length === 0) {
    console.log(
      "⚠️  No menu items available, skipping restaurant order generation"
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
      const restaurant = faker.helpers.arrayElement(restaurants);
      const orderType = faker.helpers.arrayElement(ORDER_TYPES);

      // Filter menu items that belong to this restaurant
      // Menu items have restaurant_ids array, or null for all restaurants
      const availableMenuItems = menuItems.filter(
        (item) =>
          !item.restaurant_ids ||
          item.restaurant_ids.length === 0 ||
          item.restaurant_ids.includes(restaurant.id)
      );

      // Skip this order if no menu items available for this restaurant
      if (availableMenuItems.length === 0) {
        console.log(
          `⚠️  No menu items available for restaurant ${restaurant.id}, skipping order`
        );
        continue;
      }

      // Generate order date within stay period
      const dayOffset = faker.number.int({
        min: 0,
        max: Math.max(0, stayDuration - 1),
      });
      const orderDate = new Date(checkIn);
      orderDate.setDate(orderDate.getDate() + dayOffset);

      const now = new Date();
      let status;

      if (orderDate < now) {
        // Past orders are mostly delivered or completed
        status = faker.helpers.weightedArrayElement([
          { value: "delivered", weight: 75 },
          { value: "cancelled", weight: 10 },
          { value: "ready", weight: 10 },
          { value: "preparing", weight: 5 },
        ]);
      } else {
        // Future orders (reservations) are mostly pending or confirmed
        status = faker.helpers.weightedArrayElement([
          { value: "pending", weight: 60 },
          { value: "confirmed", weight: 35 },
          { value: "cancelled", weight: 5 },
        ]);
      }

      // Generate order ID first
      const orderId = faker.string.uuid();

      // Select 1-6 menu items for this order
      const itemCount = faker.number.int({ min: 1, max: 6 });
      const selectedMenuItems = faker.helpers.arrayElements(
        availableMenuItems,
        Math.min(itemCount, availableMenuItems.length)
      );

      let totalPrice = 0;

      // Create order items
      for (const menuItem of selectedMenuItems) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const priceAtOrder = menuItem.price;
        const itemTotal = priceAtOrder * quantity;
        totalPrice += itemTotal;

        orderItems.push({
          order_id: orderId,
          menu_item_id: menuItem.id,
          quantity,
          price_at_order: priceAtOrder,
        });
      }

      // Number of guests for the order (1-6)
      const numberOfGuests = faker.number.int({ min: 1, max: 6 });

      // Special instructions (30% chance)
      const hasInstructions = faker.datatype.boolean({ probability: 0.3 });
      const specialInstructions = hasInstructions
        ? faker.helpers.arrayElement([
            "No nuts please",
            "Extra spicy",
            "Mild spice",
            "Gluten-free options",
            "Vegetarian meal",
            "Vegan options",
            "No dairy",
            "Well done",
            "Medium rare",
            "Extra sauce on the side",
            "Kids meal needed",
            null,
          ])
        : null;

      const order = {
        id: orderId,
        hotel_id: hotelId,
        guest_id: guest.id,
        order_type: orderType,
        total_price: parseFloat(totalPrice.toFixed(2)),
        status,
        special_instructions: specialInstructions,
      };

      // Add appropriate date/time fields based on order type
      if (orderType === "restaurant_booking") {
        // Restaurant booking: MUST have restaurant_id, reservation_date, reservation_time, number_of_guests
        order.restaurant_id = restaurant.id;
        order.reservation_date = orderDate.toISOString().split("T")[0];
        order.reservation_time = faker.helpers.arrayElement(TIMES);
        order.number_of_guests = numberOfGuests;
        order.table_preferences = faker.helpers.arrayElement(TABLE_PREFERENCES);
        // These must be null for restaurant_booking
        order.delivery_date = null;
        order.delivery_time = null;
      } else {
        // Room service: MUST have delivery_date
        order.delivery_date = orderDate.toISOString().split("T")[0];
        order.delivery_time = faker.helpers.arrayElement(TIMES);
        // These can be null for room_service
        order.restaurant_id = null;
        order.reservation_date = null;
        order.reservation_time = null;
        order.number_of_guests = null;
        order.table_preferences = null;
      }

      orders.push(order);
    }
  }

  return { orders, orderItems };
}
