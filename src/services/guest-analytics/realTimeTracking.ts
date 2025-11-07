/**
 * Real-time Guest Tracking Service
 *
 * Tracks guest interactions in real-time and stores in database
 */

import { supabase } from "../supabase";

/**
 * Track when guest enters a section
 */
export async function trackSectionEnter(
  guestId: string,
  hotelId: string,
  sessionId: string,
  sectionType: string
): Promise<void> {
  try {
    console.log("📍 Guest entered section:", {
      guestId,
      sectionType,
      timestamp: new Date().toISOString(),
    });

    // @ts-expect-error - Table exists but types not yet generated
    const { error } = await supabase.from("guest_section_sessions").insert({
      guest_id: guestId,
      hotel_id: hotelId,
      session_id: sessionId,
      section_type: sectionType,
      entered_at: new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Error tracking section enter:", error);
      throw error;
    }

    console.log("✅ Section enter tracked successfully");
  } catch (error) {
    console.error("❌ Failed to track section enter:", error);
  }
}

/**
 * Track when guest exits a section
 */
export async function trackSectionExit(
  guestId: string,
  sessionId: string,
  sectionType: string
): Promise<void> {
  try {
    console.log("🚪 Guest exiting section:", {
      guestId,
      sectionType,
      timestamp: new Date().toISOString(),
    });

    // Find the most recent unclosed session for this section
    // @ts-expect-error - Table exists but types not yet generated
    const { data: sessions, error: fetchError } = await supabase
      .from("guest_section_sessions")
      .select("*")
      .eq("guest_id", guestId)
      .eq("session_id", sessionId)
      .eq("section_type", sectionType)
      .is("exited_at", null)
      .order("entered_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("❌ Error fetching session:", fetchError);
      throw fetchError;
    }

    if (sessions && sessions.length > 0) {
      const session = sessions[0];
      const enteredAt = new Date(session.entered_at);
      const exitedAt = new Date();
      const durationSeconds = Math.floor(
        (exitedAt.getTime() - enteredAt.getTime()) / 1000
      );

      console.log(`⏱️ Session duration: ${durationSeconds}s`);

      // @ts-expect-error - Table exists but types not yet generated
      const { error: updateError } = await supabase
        .from("guest_section_sessions")
        .update({
          exited_at: exitedAt.toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq("id", session.id);

      if (updateError) {
        console.error("❌ Error updating session:", updateError);
        throw updateError;
      }

      console.log("✅ Section exit tracked successfully");
    } else {
      console.warn("⚠️ No open session found to close");
    }
  } catch (error) {
    console.error("❌ Failed to track section exit:", error);
  }
}

/**
 * Track item interaction (click, view, etc.)
 */
export async function trackItemInteraction(params: {
  guestId: string;
  hotelId: string;
  sessionId: string;
  sectionType: string;
  itemId?: string;
  itemName?: string;
  itemCategory?: string;
  actionType: "view" | "click" | "add_to_cart" | "order" | "detail_view";
  durationSeconds?: number;
}): Promise<void> {
  try {
    console.log("👆 Item interaction:", {
      itemName: params.itemName,
      actionType: params.actionType,
      section: params.sectionType,
      timestamp: new Date().toISOString(),
    });

    // @ts-expect-error - Table exists but types not yet generated
    const { error } = await supabase
      .from("guest_analytics_interactions")
      .insert({
        guest_id: params.guestId,
        hotel_id: params.hotelId,
        session_id: params.sessionId,
        section_type: params.sectionType,
        item_id: params.itemId || null,
        item_name: params.itemName || null,
        item_category: params.itemCategory || null,
        action_type: params.actionType,
        duration_seconds: params.durationSeconds || null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error("❌ Error tracking item interaction:", error);
      throw error;
    }

    console.log("✅ Item interaction tracked successfully");
  } catch (error) {
    console.error("❌ Failed to track item interaction:", error);
  }
}
