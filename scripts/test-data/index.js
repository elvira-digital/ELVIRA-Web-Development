import {
  getSupabaseClient,
  getTestHotelId,
  insertBatch,
  formatNumber,
  formatDuration,
} from "./utils.js";
import { generateGuests } from "./generators/guests.js";
import { generateAmenityRequests } from "./generators/amenity-requests.js";
import { generateRestaurantOrders } from "./generators/restaurant-orders.js";
import { generateShopOrders } from "./generators/shop-orders.js";
import { generateLaundryOrders } from "./generators/laundry-orders.js";
import { CONFIG } from "./config.js";

/**
 * Main function to generate test guests
 */
async function generateTestGuests() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   ELVIRA - Guest Test Data Generator                 ║");
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

    // Step 3: Generate guest data for rooms (using database hash function)
    const { guests, guestPersonalData } = await generateGuests(
      supabase,
      hotelId,
      CONFIG.roomsCount
    );

    // Step 4: Insert guests into database
    console.log(`\n💾 Inserting ${guests.length} guests into database...`);
    await insertBatch(supabase, "guests", guests, CONFIG.batchSize);

    // Step 5: Insert personal data into database
    console.log(
      `\n💾 Inserting ${guestPersonalData.length} personal data records into database...`
    );
    await insertBatch(
      supabase,
      "guest_personal_data",
      guestPersonalData,
      CONFIG.batchSize
    );

    // Step 6: Show summary
    const duration = Date.now() - startTime;
    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║   ✨ SUCCESS!                                         ║");
    console.log("╚═══════════════════════════════════════════════════════╝");
    console.log(`\n📊 Summary:`);
    console.log(`   • Rooms created: ${formatNumber(CONFIG.roomsCount)}`);
    console.log(`   • Total guests: ${formatNumber(guests.length)}`);
    console.log(
      `   • Personal data records: ${formatNumber(guestPersonalData.length)}`
    );
    console.log(
      `   • Avg guests per room: ${(guests.length / CONFIG.roomsCount).toFixed(
        2
      )}`
    );
    console.log(`   • Hotel ID: ${hotelId}`);
    console.log(`   • Time taken: ${formatDuration(duration)}`);
    console.log(`\n✓ Test data generation completed!`);
    console.log(`\n💡 Tips:`);
    console.log(
      `   • Use the room numbers and codes shown above to test guest login`
    );
    console.log(
      `   • All guests have valid tokens (checkout dates are in the future)`
    );
    console.log(`   • Guests in the same room share the same session_id`);
    console.log(`   • Check Guest Management page to see the new guests\n`);
  } catch (error) {
    console.error("\n❌ Error generating test data:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error(
      "   1. Check your .env.local file has VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY"
    );
    console.error("   2. Ensure you have at least one hotel in your database");
    console.error("   3. Check your internet connection");
    console.error("   4. Verify Supabase credentials are correct\n");
    process.exit(1);
  }
}

// Run the generator
generateTestGuests();
