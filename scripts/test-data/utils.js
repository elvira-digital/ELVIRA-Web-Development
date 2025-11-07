import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { CONFIG } from "./config.js";

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from the root directory
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

/**
 * Initialize Supabase client for test data generation
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("❌ Missing VITE_SUPABASE_URL in .env.local file");
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error(
      "❌ Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env.local file"
    );
    console.error(
      "   Find it in: Supabase Dashboard → Settings → API → service_role key"
    );
    process.exit(1);
  }

  console.log(
    "   ℹ Using service role key (bypasses RLS for admin operations)"
  );
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get hotel ID for testing
 */
export async function getTestHotelId(supabase) {
  if (CONFIG.testHotelId) {
    console.log(
      `   ✓ Using hotel: Centro Hotel Mondial (${CONFIG.testHotelId})`
    );
    return CONFIG.testHotelId;
  }

  console.log("   ℹ Fetching first hotel from database...");
  const { data: hotels, error } = await supabase
    .from("hotels")
    .select("id, name")
    .limit(1)
    .single();

  if (error || !hotels) {
    console.error(
      "   ❌ No hotels found in database. Please create a hotel first."
    );
    process.exit(1);
  }

  console.log(`   ✓ Using hotel: ${hotels.name} (${hotels.id})`);
  return hotels.id;
}

/**
 * Insert data in batches with retry logic
 */
export async function insertBatch(supabase, table, data, batchSize = 100) {
  const totalBatches = Math.ceil(data.length / batchSize);
  console.log(
    `   Inserting ${data.length} records in ${totalBatches} batches...`
  );

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const { error } = await supabase.from(table).insert(batch);

        if (error) {
          console.error(
            `   ❌ Error in batch ${batchNumber}/${totalBatches}:`,
            error.message
          );
          throw error;
        }

        success = true;
        const progress = ((batchNumber / totalBatches) * 100).toFixed(0);
        console.log(`   ✓ Batch ${batchNumber}/${totalBatches} (${progress}%)`);

        // Small delay between batches to avoid rate limiting
        if (batchNumber < totalBatches) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Reduced from 500ms to 100ms
        }
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(
            `   ⚠️  Retrying batch ${batchNumber}... (${retries} attempts left)`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }
  }
}

/**
 * Format large numbers for display
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculate and display duration
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}
