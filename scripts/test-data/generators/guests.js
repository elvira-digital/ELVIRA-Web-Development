import { faker } from "@faker-js/faker";
import { CONFIG } from "../config.js";

/**
 * Generate fake guest data with personal data
 * Note: Verification codes are hashed by calling the database RPC function
 * @param {Object} supabase - Supabase client instance
 * @param {string} hotelId - The hotel ID to assign guests to
 * @param {number} count - Number of guests to generate
 * @returns {Promise<Object>} Object with guests and guestPersonalData arrays
 */
export async function generateGuests(supabase, hotelId, count) {
  console.log(`\n📋 Generating ${count} fake guests with personal data...`);

  const guests = [];
  const guestPersonalData = [];
  const guestCredentials = []; // Store plaintext codes for console output

  for (let i = 0; i < count; i++) {
    const guestId = faker.string.uuid();
    const sessionId = faker.string.uuid(); // Same session ID for both tables
    const plainVerificationCode = faker.number
      .int({ min: 100000, max: 999999 })
      .toString();

    // Hash the verification code using the database function (same as create-guest edge function)
    const { data: hashedCode, error: hashError } = await supabase.rpc(
      "hash_verification_code",
      {
        code: plainVerificationCode,
      }
    );

    if (hashError || !hashedCode) {
      console.error(
        `❌ Failed to hash verification code for guest ${i + 1}:`,
        hashError
      );
      continue; // Skip this guest
    }

    // Generate check-in date (recent past)
    const checkInDate = faker.date.recent({ days: CONFIG.checkInDaysAgo });

    // Generate check-out date (ALWAYS in the future: 1-14 days from now)
    const now = new Date();
    const checkOutDate = faker.date.soon({ days: 14, refDate: now });

    // Guest is active if checked in and not checked out yet
    const isActive = checkInDate <= now && checkOutDate >= now;

    // Access code expires at checkout (guaranteed future date)
    const accessCodeExpiresAt = checkOutDate.toISOString();

    // Generate room number
    const roomNumber = faker.number
      .int(CONFIG.roomRange)
      .toString()
      .padStart(3, "0");

    // Guest record
    const guest = {
      id: guestId,
      hotel_id: hotelId,
      room_number: roomNumber,
      guest_name: faker.person.fullName(),
      hashed_verification_code: hashedCode,
      access_code_expires_at: accessCodeExpiresAt,
      is_active: isActive,
      dnd_status: faker.datatype.boolean(0.1), // 10% chance of DND
      session_id: sessionId,
      created_by: CONFIG.createdByStaffId,
      created_at: checkInDate.toISOString(),
      updated_at: checkInDate.toISOString(),
    };

    // Personal data record
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const personalData = {
      guest_id: guestId,
      first_name: firstName,
      last_name: lastName,
      guest_email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone_number: faker.phone.number(),
      country: faker.location.countryCode(),
      date_of_birth: faker.date
        .birthdate({ min: 18, max: 80, mode: "age" })
        .toISOString()
        .split("T")[0],
      language: faker.helpers.arrayElement(CONFIG.languages),
      hashed_verification_code: hashedCode,
      session_id: sessionId,
      updated_at: checkInDate.toISOString(),
    };

    guests.push(guest);
    guestPersonalData.push(personalData);
    guestCredentials.push({
      roomNumber,
      plainVerificationCode,
      firstName,
      lastName,
      expiresAt: checkOutDate,
    });

    // Show progress every 10 guests
    if ((i + 1) % 10 === 0) {
      console.log(`   Generated ${i + 1}/${count} guests...`);
    }
  }

  // Show first 5 credentials for testing
  console.log(`\n🔑 First 5 guest credentials for testing:`);
  for (let i = 0; i < Math.min(5, guestCredentials.length); i++) {
    const cred = guestCredentials[i];
    const daysValid = Math.ceil(
      (cred.expiresAt - new Date()) / (1000 * 60 * 60 * 24)
    );
    console.log(
      `   Room ${cred.roomNumber} | Code: ${cred.plainVerificationCode} | Name: ${cred.firstName} ${cred.lastName} | Valid for ${daysValid} days`
    );
  }

  console.log(
    `   ✓ Generated ${guests.length} guests and ${guestPersonalData.length} personal data records!`
  );
  return { guests, guestPersonalData };
}
