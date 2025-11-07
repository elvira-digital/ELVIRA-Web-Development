import {
  getSupabaseClient,
  getTestHotelId,
  insertBatch,
  formatNumber,
  formatDuration,
} from "./utils.js";
import { generateAmenityRequests } from "./generators/amenity-requests.js";
import { generateRestaurantOrders } from "./generators/restaurant-orders.js";
import { generateShopOrders } from "./generators/shop-orders.js";
import { generateLaundryOrders } from "./generators/laundry-orders.js";
import { CONFIG } from "./config.js";

/**
 * Main function to generate orders for existing guests
 */
async function generateTestOrders() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   ELVIRA - Order Test Data Generator                 ║");
  console.log("╚═══════════════════════════════════════════════════════╝");

  const startTime = Date.now();

  try {
    // Step 1: Initialize Supabase
    console.log("\n🔌 Connecting to Supabase...");
    const supabase = getSupabaseClient();
    console.log("   ✓ Connected successfully!");

    // Step 2: Get hotel ID
    console.log("\n🏨 Finding hotel...");
    const hotelId = await getTestHotelId(supabase);

    // Step 3: Fetch existing guests
    console.log("\n👥 Fetching existing guests...");
    const { data: guests, error: guestsError } = await supabase
      .from("guests")
      .select("id, access_code_expires_at, room_number")
      .eq("hotel_id", hotelId)
      .eq("is_active", true) // Only active guests
      .order("created_at", { ascending: false });

    if (guestsError) throw guestsError;
    if (!guests || guests.length === 0) {
      console.log(
        "\n❌ No active guests found! Please run guest generation first:"
      );
      console.log("   npm run generate");
      process.exit(1);
    }

    // Transform guests to add check_in_date and checkout_date based on access_code_expires_at
    // access_code_expires_at is the checkout date
    // Assume check-in was 1-14 days before checkout
    const now = new Date();
    const enrichedGuests = guests.map((guest) => {
      const checkout = new Date(guest.access_code_expires_at);
      // Calculate check-in as 7 days before checkout (average stay)
      const checkIn = new Date(checkout);
      checkIn.setDate(checkIn.getDate() - 7);

      // If check-in is in the future, adjust it to now
      if (checkIn > now) {
        checkIn.setTime(now.getTime());
      }

      return {
        id: guest.id,
        room_number: guest.room_number,
        check_in_date: checkIn.toISOString(),
        checkout_date: checkout.toISOString(),
      };
    });

    console.log(
      `   ✓ Found ${formatNumber(enrichedGuests.length)} active guests`
    );

    // Step 4: Fetch available resources
    console.log("\n📦 Fetching available resources...");

    // Fetch amenities
    const { data: amenities, error: amenitiesError } = await supabase
      .from("amenities")
      .select("id, name, category")
      .eq("hotel_id", hotelId)
      .eq("is_active", true);

    if (amenitiesError) throw amenitiesError;
    console.log(`   • Amenities: ${formatNumber(amenities?.length || 0)}`);

    // Fetch restaurants
    const { data: restaurants, error: restaurantsError } = await supabase
      .from("restaurants")
      .select("id, name, cuisine")
      .eq("hotel_id", hotelId)
      .eq("is_active", true);

    if (restaurantsError) throw restaurantsError;
    console.log(`   • Restaurants: ${formatNumber(restaurants?.length || 0)}`);

    // Fetch menu items
    const { data: menuItems, error: menuItemsError } = await supabase
      .from("menu_items")
      .select("id, name, price, category, restaurant_ids")
      .eq("hotel_id", hotelId)
      .eq("is_active", true);

    if (menuItemsError) throw menuItemsError;
    console.log(`   • Menu items: ${formatNumber(menuItems?.length || 0)}`);

    // Fetch products (shop items)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, category")
      .eq("hotel_id", hotelId)
      .eq("is_active", true);

    if (productsError) throw productsError;
    console.log(`   • Products: ${formatNumber(products?.length || 0)}`);

    // Fetch laundry services
    const { data: laundryServices, error: laundryError } = await supabase
      .from("laundry_services")
      .select("id, category, description, price")
      .eq("hotel_id", hotelId)
      .eq("is_active", true);

    if (laundryError) throw laundryError;
    console.log(
      `   • Laundry services: ${formatNumber(laundryServices?.length || 0)}`
    );

    // Step 5: Generate Amenity Requests
    console.log("\n🛎️  Generating amenity requests...");
    const amenityRequests = await generateAmenityRequests(
      supabase,
      hotelId,
      enrichedGuests,
      amenities,
      CONFIG.orders.amenityRequests
    );
    console.log(
      `   ✓ Generated ${formatNumber(amenityRequests.length)} amenity requests`
    );

    if (amenityRequests.length > 0) {
      console.log("   💾 Inserting amenity requests...");
      await insertBatch(
        supabase,
        "amenity_requests",
        amenityRequests,
        CONFIG.batchSize
      );
      console.log("   ✓ Inserted successfully!");
    }

    // Step 6: Generate Restaurant Orders
    console.log("\n🍽️  Generating restaurant orders...");
    const { orders: restaurantOrders, orderItems: restaurantOrderItems } =
      await generateRestaurantOrders(
        supabase,
        hotelId,
        enrichedGuests,
        restaurants,
        menuItems,
        CONFIG.orders.restaurantOrders
      );
    console.log(
      `   ✓ Generated ${formatNumber(
        restaurantOrders.length
      )} restaurant orders`
    );
    console.log(
      `   ✓ Generated ${formatNumber(restaurantOrderItems.length)} order items`
    );

    if (restaurantOrders.length > 0) {
      console.log("   💾 Inserting restaurant orders...");
      await insertBatch(
        supabase,
        "dine_in_orders",
        restaurantOrders,
        CONFIG.batchSize
      );
      console.log("   ✓ Inserted orders!");

      console.log("   💾 Inserting order items...");
      await insertBatch(
        supabase,
        "dine_in_order_items",
        restaurantOrderItems,
        CONFIG.batchSize
      );
      console.log("   ✓ Inserted order items!");
    }

    // Step 7: Generate Shop Orders
    console.log("\n🛍️  Generating shop orders...");
    const { orders: shopOrders, orderItems: shopOrderItems } =
      await generateShopOrders(
        supabase,
        hotelId,
        enrichedGuests,
        products,
        CONFIG.orders.shopOrders
      );
    console.log(
      `   ✓ Generated ${formatNumber(shopOrders.length)} shop orders`
    );
    console.log(
      `   ✓ Generated ${formatNumber(shopOrderItems.length)} order items`
    );

    if (shopOrders.length > 0) {
      console.log("   💾 Inserting shop orders...");
      await insertBatch(supabase, "shop_orders", shopOrders, CONFIG.batchSize);
      console.log("   ✓ Inserted orders!");

      console.log("   💾 Inserting order items...");
      await insertBatch(
        supabase,
        "shop_order_items",
        shopOrderItems,
        CONFIG.batchSize
      );
      console.log("   ✓ Inserted order items!");
    }

    // Step 8: Generate Laundry Orders
    console.log("\n🧺 Generating laundry orders...");
    const { orders: laundryOrders, orderItems: laundryOrderItems } =
      await generateLaundryOrders(
        supabase,
        hotelId,
        enrichedGuests,
        laundryServices,
        CONFIG.orders.laundryOrders
      );
    console.log(
      `   ✓ Generated ${formatNumber(laundryOrders.length)} laundry orders`
    );
    console.log(
      `   ✓ Generated ${formatNumber(laundryOrderItems.length)} order items`
    );

    if (laundryOrders.length > 0) {
      console.log("   💾 Inserting laundry orders...");
      await insertBatch(
        supabase,
        "laundry_orders",
        laundryOrders,
        CONFIG.batchSize
      );
      console.log("   ✓ Inserted orders!");

      console.log("   💾 Inserting order items...");
      await insertBatch(
        supabase,
        "laundry_order_items",
        laundryOrderItems,
        CONFIG.batchSize
      );
      console.log("   ✓ Inserted order items!");
    }

    // Step 9: Show summary
    const duration = Date.now() - startTime;
    const totalOrders =
      amenityRequests.length +
      restaurantOrders.length +
      shopOrders.length +
      laundryOrders.length;
    const totalOrderItems =
      restaurantOrderItems.length +
      shopOrderItems.length +
      laundryOrderItems.length;
    const totalRecords = totalOrders + totalOrderItems;

    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║   ✨ SUCCESS!                                         ║");
    console.log("╚═══════════════════════════════════════════════════════╝");
    console.log(`\n📊 Summary:`);
    console.log(
      `   • Guests processed: ${formatNumber(enrichedGuests.length)}`
    );
    console.log(
      `   • Amenity requests: ${formatNumber(amenityRequests.length)}`
    );
    console.log(
      `   • Restaurant orders: ${formatNumber(
        restaurantOrders.length
      )} (${formatNumber(restaurantOrderItems.length)} items)`
    );
    console.log(
      `   • Shop orders: ${formatNumber(shopOrders.length)} (${formatNumber(
        shopOrderItems.length
      )} items)`
    );
    console.log(
      `   • Laundry orders: ${formatNumber(
        laundryOrders.length
      )} (${formatNumber(laundryOrderItems.length)} items)`
    );
    console.log(`   • Total orders: ${formatNumber(totalOrders)}`);
    console.log(`   • Total order items: ${formatNumber(totalOrderItems)}`);
    console.log(`   • Total records inserted: ${formatNumber(totalRecords)}`);
    console.log(`   • Hotel ID: ${hotelId}`);
    console.log(`   • Time taken: ${formatDuration(duration)}`);
    console.log(`\n✓ Order generation completed!`);
    console.log(`\n💡 Tips:`);
    console.log(`   • Check order management pages to see the new orders`);
    console.log(`   • Orders have realistic statuses based on dates`);
    console.log(`   • Order items are properly linked to their orders`);
    console.log(
      `   • Restaurant orders only include menu items from selected restaurant\n`
    );
  } catch (error) {
    console.error("\n❌ Error generating orders:", error.message);
    console.error("\n🔍 Error details:", error);
    console.error("\n🔍 Troubleshooting:");
    console.error(
      "   1. Make sure guests exist in the database (run: npm run generate)"
    );
    console.error(
      "   2. Check that amenities, restaurants, products, and services are set up"
    );
    console.error("   3. Verify database tables have correct structure");
    console.error("   4. Check your internet connection\n");
    process.exit(1);
  }
}

// Run the generator
generateTestOrders();
