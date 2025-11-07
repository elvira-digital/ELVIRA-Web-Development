import { getSupabaseClient } from "./utils.js";
import { CONFIG } from "./config.js";

async function queryResources() {
  const supabase = getSupabaseClient();
  const hotelId = CONFIG.hotelId;

  console.log("Fetching available resources for hotel:", hotelId);
  console.log("=".repeat(80));

  // Get amenities
  const { data: amenities, error: amenitiesError } = await supabase
    .from("amenities")
    .select("id, name, category")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);

  if (amenitiesError) {
    console.error("Error fetching amenities:", amenitiesError);
  } else {
    console.log("\nAMENITIES:", amenities?.length || 0);
    amenities?.forEach((a) => console.log(`  - ${a.name} (${a.category})`));
  }

  // Get restaurants
  const { data: restaurants, error: restaurantsError } = await supabase
    .from("restaurants")
    .select("id, name, cuisine_type")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);

  if (restaurantsError) {
    console.error("Error fetching restaurants:", restaurantsError);
  } else {
    console.log("\nRESTAURANTS:", restaurants?.length || 0);
    restaurants?.forEach((r) =>
      console.log(`  - ${r.name} (${r.cuisine_type})`)
    );
  }

  // Get laundry services
  const { data: laundryServices, error: laundryError } = await supabase
    .from("laundry_services")
    .select("id, category, description, price")
    .eq("hotel_id", hotelId)
    .eq("is_active", true);

  if (laundryError) {
    console.error("Error fetching laundry services:", laundryError);
  } else {
    console.log("\nLAUNDRY SERVICES:", laundryServices?.length || 0);
    laundryServices?.forEach((l) =>
      console.log(`  - ${l.category}: ${l.description || "N/A"} ($${l.price})`)
    );
  }

  // Get shop items
  const { data: shopItems, error: shopError } = await supabase
    .from("shop_items")
    .select("id, name, category, price")
    .eq("hotel_id", hotelId)
    .eq("is_available", true);

  if (shopError) {
    console.error("Error fetching shop items:", shopError);
  } else {
    console.log("\nSHOP ITEMS:", shopItems?.length || 0);
    shopItems?.forEach((s) =>
      console.log(`  - ${s.name} (${s.category}) - $${s.price}`)
    );
  }

  console.log("\n" + "=".repeat(80));
}

queryResources();
