import { supabase } from "../supabase";
import type { GuestAuthResponse } from "../../types/guest";

export async function authenticateGuest(
  roomNumber: string,
  verificationCode: string
): Promise<GuestAuthResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("guest-auth", {
      body: {
        roomNumber,
        verificationCode,
      },
    });

    if (error) {
      console.error("Guest auth error:", error);
      return {
        success: false,
        error: "Authentication failed. Please try again.",
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Invalid credentials",
      };
    }

    return data as GuestAuthResponse;
  } catch (error) {
    console.error("Guest auth exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export function saveGuestSession(
  token: string,
  guestData: any,
  hotelData: any
): void {
  const now = new Date();
  const sessionExpiresAt = new Date(now.getTime() + 40 * 60 * 1000); // 40 minutes from now
  
  const session = {
    token,
    guestData,
    hotelData,
    timestamp: now.toISOString(),
    sessionExpiresAt: sessionExpiresAt.toISOString(), // Frontend session timeout (40 min security limit)
  };
  localStorage.setItem("guestSession", JSON.stringify(session));
}

export function getGuestSession() {
  const sessionStr = localStorage.getItem("guestSession");
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr);
    const now = new Date();

    // Check if 40-minute frontend session has expired
    if (session.sessionExpiresAt) {
      const sessionExpiry = new Date(session.sessionExpiresAt);
      if (sessionExpiry < now) {
        console.log("⏰ Guest session expired (40 minutes timeout)");
        clearGuestSession();
        return null;
      }
    }

    // Check if database access code has expired
    const expiresAt = new Date(session.guestData.access_code_expires_at);
    if (expiresAt < now) {
      console.log("⏰ Guest access code expired");
      clearGuestSession();
      return null;
    }

    return session;
  } catch {
    clearGuestSession();
    return null;
  }
}

export function clearGuestSession(): void {
  localStorage.removeItem("guestSession");
}
