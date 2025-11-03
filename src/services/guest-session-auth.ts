import { supabase } from "./supabase";

// Guest Session Login Flow - Hybrid Approach
// Supports both: single shared code OR individual codes

interface Guest {
  id: string;
  session_id: string;
  guest_personal_data: {
    first_name: string;
    last_name: string;
    guest_email: string;
  };
}

/**
 * Step 1: Guest enters verification code
 */
export async function loginWithCode(hotelId: string, code: string) {
  // Note: You'll need to implement the hash_verification_code function
  // For now, using placeholder - replace with actual RPC call
  const { data: hashedData } = await supabase.rpc("hash_verification_code", {
    code: code,
  });

  const hashedCode = hashedData;

  // Find all guests with this code
  const { data: guests, error } = await supabase
    .from("guests")
    .select("*, guest_personal_data(*)")
    .eq("hotel_id", hotelId)
    .eq("hashed_verification_code", hashedCode)
    .gt("access_code_expire_at", new Date().toISOString());

  if (error || !guests || guests.length === 0) {
    throw new Error("Invalid code or code expired");
  }

  // If only ONE guest with this code → Direct login
  if (guests.length === 1) {
    return {
      type: "single",
      guest: guests[0],
      sessionId: guests[0].session_id,
    };
  }

  // If MULTIPLE guests with same code → Show selection
  return {
    type: "multiple",
    guests: guests,
    sessionId: guests[0].session_id,
  };
}

/**
 * Step 2a: Single guest - Store and proceed
 */
export function loginSingleGuest(guest: Guest) {
  // Store guest identity
  localStorage.setItem("current_guest_id", guest.id);
  localStorage.setItem("current_session_id", guest.session_id);

  // Redirect to guest dashboard
  return guest;
}

/**
 * Step 2b: Multiple guests - Show selection screen
 */
export function showGuestSelection(guests: Guest[]) {
  // UI shows:
  // "Who are you?"
  // - John Smith (Primary Guest)
  // - Jane Smith
  // - Tommy Smith (Age 12)
  // - Sarah Smith (Age 8)

  return guests.map((g) => ({
    id: g.id,
    name: `${g.guest_personal_data.first_name} ${g.guest_personal_data.last_name}`,
    email: g.guest_personal_data.guest_email,
  }));
}

/**
 * Step 3: Guest selects their identity
 */
export function selectGuest(guestId: string, sessionId: string) {
  // Store selected guest
  localStorage.setItem("current_guest_id", guestId);
  localStorage.setItem("current_session_id", sessionId);

  // Remember for future logins on this device
  localStorage.setItem("preferred_guest_id", guestId);

  // Redirect to personalized dashboard
}

/**
 * Step 4: Future logins - Auto-select if remembered
 */
export async function autoLogin(hotelId: string, code: string) {
  const loginResult = await loginWithCode(hotelId, code);

  if (loginResult.type === "single") {
    return loginSingleGuest(loginResult.guest);
  }

  // Check if we remember this guest's preference on this device
  const preferredGuestId = localStorage.getItem("preferred_guest_id");

  if (preferredGuestId) {
    const preferredGuest = loginResult.guests.find(
      (g) => g.id === preferredGuestId
    );
    if (preferredGuest) {
      return loginSingleGuest(preferredGuest);
    }
  }

  // No preference or guest not found → Show selection
  return showGuestSelection(loginResult.guests);
}
