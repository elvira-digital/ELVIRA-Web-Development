import { supabase } from "./supabase";
import type { GuestFormData } from "../screens/hotel/guest-management/types";

interface CreateGuestSessionParams {
  hotelId: string;
  formData: GuestFormData;
}

interface CreateGuestSessionResponse {
  success: boolean;
  sessionId: string;
  roomNumber: string;
  guestsCreated: number;
  guests: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  emailResults: Array<{
    guest: string;
    sent: boolean;
    result?: unknown;
    error?: string;
  }>;
  roomCleaningCreated: boolean;
}

/**
 * Creates a guest session with multiple guests sharing the same room
 * Each guest gets their own unique access code
 */
export async function createGuestSession({
  hotelId,
  formData,
}: CreateGuestSessionParams): Promise<CreateGuestSessionResponse> {
  // Generate a unique session ID for all guests in this booking
  const sessionId = crypto.randomUUID();

  // Transform form data to match edge function expectations
  const requestPayload = {
    hotelId,
    sessionId,
    roomNumber: formData.roomNumber,
    checkoutDate: formData.checkoutDate,
    isActive: true,
    dndStatus: false,
    guests: formData.guests.map((guest) => ({
      verificationCode: guest.accessCode,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phoneNumber,
      dateOfBirth: guest.dateOfBirth,
      country: guest.country,
      language: guest.language,
    })),
  };

  console.log("📤 Creating guest session:", {
    sessionId,
    roomNumber: formData.roomNumber,
    guestCount: formData.guests.length,
  });

  // Get fresh session (this will auto-refresh if needed)
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error("❌ No authenticated session:", sessionError);
    throw new Error("You must be logged in to create guests");
  }

  // Refresh the session to ensure token is valid
  const {
    data: { session: refreshedSession },
    error: refreshError,
  } = await supabase.auth.refreshSession();

  const activeSession = refreshedSession || session;

  console.log("✅ Session found:", {
    userId: activeSession.user.id,
    email: activeSession.user.email,
    hasAccessToken: !!activeSession.access_token,
    tokenPreview: activeSession.access_token?.substring(0, 20) + "...",
    expiresAt: new Date(activeSession.expires_at! * 1000).toISOString(),
  });

  // Call the edge function - the Supabase client should auto-add the auth header
  console.log("📞 Calling edge function with payload:", {
    hotelId,
    sessionId,
    roomNumber: formData.roomNumber,
    guestCount: formData.guests.length,
  });

  const { data, error } = await supabase.functions.invoke("create-guest", {
    body: requestPayload,
  });

  console.log("📨 Edge function response:", {
    success: data?.success,
    error: error?.message,
    statusCode: error?.context?.status,
  });

  if (error) {
    console.error("❌ Edge function error details:", {
      message: error.message,
      context: error.context,
      name: error.name,
    });
    throw new Error(error.message || "Failed to create guest session");
  }

  if (!data?.success) {
    console.error("❌ Guest session creation failed:", data);
    throw new Error(data?.error || "Failed to create guest session");
  }

  console.log("✅ Guest session created successfully:", data);

  return data;
}

/**
 * Validates that all guests have required fields and access codes
 */
export function validateGuestForm(formData: GuestFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate room information
  if (!formData.roomNumber.trim()) {
    errors.push("Room number is required");
  }

  if (!formData.checkoutDate) {
    errors.push("Checkout date is required");
  }

  // Validate each guest
  formData.guests.forEach((guest, index) => {
    const guestNumber = index + 1;

    if (!guest.accessCode || guest.accessCode.length !== 6) {
      errors.push(`Guest ${guestNumber}: Access code must be 6 digits`);
    }

    if (!guest.firstName.trim()) {
      errors.push(`Guest ${guestNumber}: First name is required`);
    }

    if (!guest.lastName.trim()) {
      errors.push(`Guest ${guestNumber}: Last name is required`);
    }

    if (!guest.email.trim()) {
      errors.push(`Guest ${guestNumber}: Email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      errors.push(`Guest ${guestNumber}: Invalid email format`);
    }

    if (!guest.country) {
      errors.push(`Guest ${guestNumber}: Country is required`);
    }

    if (!guest.language) {
      errors.push(`Guest ${guestNumber}: Language is required`);
    }
  });

  // Check for duplicate access codes
  const accessCodes = formData.guests.map((g) => g.accessCode).filter(Boolean);
  const uniqueCodes = new Set(accessCodes);
  if (accessCodes.length !== uniqueCodes.size) {
    errors.push("Each guest must have a unique access code");
  }

  // Check for duplicate emails
  const emails = formData.guests
    .map((g) => g.email.toLowerCase())
    .filter(Boolean);
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    errors.push("Each guest must have a unique email address");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
