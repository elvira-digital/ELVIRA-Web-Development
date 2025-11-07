import { faker } from "@faker-js/faker";
import { CONFIG } from "../config.js";

/**
 * Generate fake guest data with personal data for room groups
 * Creates realistic families/couples sharing the same session_id
 * Note: Verification codes are hashed by calling the database RPC function
 * @param {Object} supabase - Supabase client instance
 * @param {string} hotelId - The hotel ID to assign guests to
 * @param {number} roomCount - Number of rooms to generate (each room has 1-4 guests)
 * @returns {Promise<Object>} Object with guests and guestPersonalData arrays
 */
export async function generateGuests(supabase, hotelId, roomCount) {
  console.log(`\n📋 Generating guests for ${roomCount} rooms...`);

  const guests = [];
  const guestPersonalData = [];
  const guestCredentials = []; // Store plaintext codes for console output

  const now = new Date();
  let totalGuestsGenerated = 0;

  for (let roomIndex = 0; roomIndex < roomCount; roomIndex++) {
    // Shared session ID for all guests in this room
    const sessionId = faker.string.uuid();

    // Generate room number (unique)
    const roomNumber = faker.number
      .int(CONFIG.roomRange)
      .toString()
      .padStart(3, "0");

    // Generate check-in date (within last 7 days)
    const checkInDate = faker.date.recent({ days: CONFIG.checkInDaysAgo });

    // Generate stay duration (1-14 days)
    const stayDuration = faker.number.int(CONFIG.stayDuration);

    // Calculate checkout date based on check-in + duration
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + stayDuration);

    // Ensure checkout is ALWAYS in the future (minimum 1 day from now)
    const minCheckout = new Date(now);
    minCheckout.setDate(minCheckout.getDate() + 1);
    if (checkOutDate < minCheckout) {
      checkOutDate.setTime(minCheckout.getTime());
    }

    // Room is active if checked in and not checked out yet
    const isActive = checkInDate <= now && checkOutDate >= now;

    // Access code expires at checkout (guaranteed future date)
    const accessCodeExpiresAt = checkOutDate.toISOString();

    // Determine number of guests in this room (1-4)
    const guestsInRoom = faker.number.int(CONFIG.guestsPerRoom);

    // Generate shared family name for multi-guest rooms
    const familyLastName = faker.person.lastName();

    // Shared country and language for all guests in room
    const country = faker.helpers.arrayElement(CONFIG.countries);
    const language = faker.helpers.arrayElement(CONFIG.languages);

    // Generate guests for this room
    for (let guestIndex = 0; guestIndex < guestsInRoom; guestIndex++) {
      const guestId = faker.string.uuid();
      const plainVerificationCode = faker.number
        .int({ min: 100000, max: 999999 })
        .toString();

      // Hash the verification code using the database function
      const { data: hashedCode, error: hashError } = await supabase.rpc(
        "hash_verification_code",
        {
          code: plainVerificationCode,
        }
      );

      if (hashError || !hashedCode) {
        console.error(
          `❌ Failed to hash verification code for room ${roomNumber}, guest ${
            guestIndex + 1
          }:`,
          hashError
        );
        continue;
      }

      // Determine guest role and age range
      const isPrimaryGuest = guestIndex === 0;
      const isChild = guestsInRoom > 2 && guestIndex >= 2; // 3rd and 4th guests are children

      // Generate appropriate age
      const age = isChild
        ? faker.number.int({ min: 3, max: 17 })
        : faker.number.int({ min: 18, max: 75 });

      const firstName = faker.person.firstName();
      const lastName =
        guestsInRoom > 1 ? familyLastName : faker.person.lastName(); // Share last name in groups
      const fullName = `${firstName} ${lastName}`;

      // Guest record
      const guest = {
        id: guestId,
        hotel_id: hotelId,
        room_number: roomNumber,
        guest_name: fullName,
        hashed_verification_code: hashedCode,
        access_code_expires_at: accessCodeExpiresAt,
        is_active: isActive,
        dnd_status: faker.datatype.boolean(0.05), // 5% chance of DND
        session_id: sessionId, // Shared session ID
        created_by: CONFIG.createdByStaffId,
        created_at: checkInDate.toISOString(),
        updated_at: checkInDate.toISOString(),
      };

      // Personal data record
      const personalData = {
        guest_id: guestId,
        first_name: firstName,
        last_name: lastName,
        guest_email: isPrimaryGuest
          ? faker.internet.email({ firstName, lastName }).toLowerCase()
          : faker.internet.email({ firstName, lastName }).toLowerCase(), // Each guest can have email
        phone_number: isPrimaryGuest ? faker.phone.number() : null, // Only primary guest has phone
        country: country,
        date_of_birth: faker.date
          .birthdate({ min: age, max: age, mode: "age" })
          .toISOString()
          .split("T")[0],
        language: language,
        hashed_verification_code: hashedCode,
        session_id: sessionId, // Shared session ID
        updated_at: checkInDate.toISOString(),
      };

      guests.push(guest);
      guestPersonalData.push(personalData);

      // Store credentials for primary guest only
      if (isPrimaryGuest) {
        guestCredentials.push({
          roomNumber,
          plainVerificationCode,
          firstName,
          lastName,
          expiresAt: checkOutDate,
          guestsCount: guestsInRoom,
        });
      }

      totalGuestsGenerated++;
    }

    // Show progress every 50 rooms
    if ((roomIndex + 1) % 50 === 0) {
      console.log(
        `   Generated ${
          roomIndex + 1
        }/${roomCount} rooms (${totalGuestsGenerated} total guests)...`
      );
    }
  }

  // Show first 5 room credentials for testing
  console.log(`\n🔑 First 5 room credentials for testing:`);
  for (let i = 0; i < Math.min(5, guestCredentials.length); i++) {
    const cred = guestCredentials[i];
    const daysValid = Math.ceil(
      (cred.expiresAt - new Date()) / (1000 * 60 * 60 * 24)
    );
    console.log(
      `   Room ${cred.roomNumber} | Code: ${cred.plainVerificationCode} | ${cred.firstName} ${cred.lastName} | ${cred.guestsCount} guest(s) | Valid ${daysValid} days`
    );
  }

  console.log(
    `\n✓ Generated ${roomCount} rooms with ${totalGuestsGenerated} total guests!`
  );
  console.log(`   - ${guests.length} guest records`);
  console.log(`   - ${guestPersonalData.length} personal data records`);

  return { guests, guestPersonalData };
}
