/**
 * Guest Dashboard Behavior Service
 *
 * Service for fetching hotel-specific guest dashboard behavior data from database
 */

import { supabase } from "../supabase";
import type {
  GuestBehaviorMetrics,
  GuestDashboardSection,
  PopularItem,
} from "../../types/guest-analytics";

// Database record types
interface SessionRecord {
  id: string;
  guest_id: string;
  hotel_id: string;
  session_id: string;
  section_type: string;
  entered_at: string;
  exited_at?: string | null;
  duration_seconds?: number | null;
}

interface InteractionRecord {
  id: string;
  guest_id: string;
  hotel_id: string;
  session_id: string;
  section_type: string;
  item_id?: string | null;
  item_name?: string | null;
  item_category?: string | null;
  action_type: string;
  duration_seconds?: number | null;
  created_at: string;
}

/**
 * Fetch hotel-specific guest behavior metrics from database
 */
export async function fetchGuestBehaviorMetrics(
  hotelId?: string
): Promise<GuestBehaviorMetrics> {
  console.log(
    "📊 Fetching real behavior metrics for hotel:",
    hotelId || "all hotels"
  );

  try {
    // Build query for section sessions with optional hotel filter
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Table exists but types not yet generated
    let sessionsQuery = supabase.from("guest_section_sessions").select("*");

    if (hotelId) {
      sessionsQuery = sessionsQuery.eq("hotel_id", hotelId);
    }

    const { data: sessionData, error: sessionError } = await sessionsQuery;

    if (sessionError) {
      console.error("❌ Error fetching session data:", sessionError);
      return getEmptyMetrics();
    }

    console.log("✅ Fetched session records:", sessionData?.length || 0);

    // Build query for interactions with optional hotel filter
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Table exists but types not yet generated
    let interactionsQuery = supabase
      .from("guest_analytics_interactions")
      .select("*");

    if (hotelId) {
      interactionsQuery = interactionsQuery.eq("hotel_id", hotelId);
    }

    const { data: interactionData, error: interactionError } =
      await interactionsQuery;

    if (interactionError) {
      console.error("❌ Error fetching interaction data:", interactionError);
      return getEmptyMetrics();
    }

    console.log(
      "✅ Fetched interaction records:",
      interactionData?.length || 0
    );

    // Calculate metrics from real data
    const sections = calculateSectionMetrics(
      (sessionData as unknown as SessionRecord[]) || [],
      (interactionData as unknown as InteractionRecord[]) || []
    );
    const totalSessions = calculateTotalSessions(
      (sessionData as unknown as SessionRecord[]) || []
    );
    const avgSessionDuration = calculateAvgDuration(
      (sessionData as unknown as SessionRecord[]) || []
    );
    const mostPopularItems = calculatePopularItems(
      (interactionData as unknown as InteractionRecord[]) || []
    );

    console.log("📈 Calculated metrics:", {
      totalSessions,
      avgSessionDuration,
      sectionsCount: sections.length,
    });

    return {
      totalSessions,
      avgSessionDuration,
      sections,
      mostPopularItems,
    };
  } catch (error) {
    console.error("❌ Error in fetchGuestBehaviorMetrics:", error);
    return getEmptyMetrics();
  }
}

/**
 * Calculate section-level metrics from session and interaction data
 */
function calculateSectionMetrics(
  sessions: SessionRecord[],
  interactions: InteractionRecord[]
): GuestDashboardSection[] {
  console.log("🔢 Calculating section metrics from:", {
    sessionsCount: sessions.length,
    interactionsCount: interactions.length,
  });

  // Group sessions by section
  const sectionMap = new Map<
    string,
    {
      timeSpent: number;
      visitCount: number;
      clickCount: number;
    }
  >();

  // Process session data
  sessions.forEach((session) => {
    const section = session.section_type;
    const existing = sectionMap.get(section) || {
      timeSpent: 0,
      visitCount: 0,
      clickCount: 0,
    };

    existing.timeSpent += session.duration_seconds || 0;
    existing.visitCount += 1;

    sectionMap.set(section, existing);
    console.log(
      `📊 Session processed: ${section} | duration: ${session.duration_seconds}s | total time: ${existing.timeSpent}s`
    );
  });

  // Process interaction data (clicks)
  interactions.forEach((interaction) => {
    const section = interaction.section_type;
    const existing = sectionMap.get(section) || {
      timeSpent: 0,
      visitCount: 0,
      clickCount: 0,
    };

    if (interaction.action_type === "click") {
      existing.clickCount += 1;
      console.log(
        `👆 Click counted: ${section} | item: ${interaction.item_name} | total clicks: ${existing.clickCount}`
      );
    }

    sectionMap.set(section, existing);
  });

  // Convert to array with friendly names
  const sectionNames: Record<string, string> = {
    home: "Home Dashboard",
    amenities: "Amenities & Services",
    restaurant: "Restaurant & Dining",
    shop: "Hotel Shop",
    laundry: "Laundry Services",
    places: "Places to Visit",
    tours: "Tours & Experiences",
    wellness: "Wellness & Spa",
    gastronomy: "Local Gastronomy",
    qa: "Q&A Support",
    "to-visit": "Places to Visit",
  };

  const sections: GuestDashboardSection[] = [];
  sectionMap.forEach((metrics, sectionId) => {
    sections.push({
      sectionId,
      sectionName: sectionNames[sectionId] || sectionId,
      timeSpent: metrics.timeSpent,
      clickCount: metrics.clickCount,
      visitCount: metrics.visitCount,
      avgTimePerVisit:
        metrics.visitCount > 0
          ? Math.floor(metrics.timeSpent / metrics.visitCount)
          : 0,
    });
  });

  // Sort by time spent descending
  sections.sort((a, b) => b.timeSpent - a.timeSpent);

  return sections;
}

/**
 * Calculate total unique sessions
 */
function calculateTotalSessions(sessions: SessionRecord[]): number {
  const uniqueSessions = new Set(sessions.map((s) => s.session_id));
  return uniqueSessions.size;
}

/**
 * Calculate average session duration
 */
function calculateAvgDuration(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;

  // Group by session and sum time per session
  const sessionTimes = new Map<string, number>();
  sessions.forEach((session) => {
    const sessionId = session.session_id;
    const existing = sessionTimes.get(sessionId) || 0;
    sessionTimes.set(sessionId, existing + (session.duration_seconds || 0));
  });

  // Calculate average
  const totalTime = Array.from(sessionTimes.values()).reduce(
    (sum, time) => sum + time,
    0
  );
  const avgSeconds = sessionTimes.size > 0 ? totalTime / sessionTimes.size : 0;

  return Math.floor(avgSeconds);
}

/**
 * Return empty metrics structure
 */
function getEmptyMetrics(): GuestBehaviorMetrics {
  return {
    totalSessions: 0,
    avgSessionDuration: 0,
    sections: [],
    mostPopularItems: [],
  };
}

/**
 * Calculate most popular items from interaction data
 */
function calculatePopularItems(
  interactions: InteractionRecord[]
): PopularItem[] {
  // Count interactions and unique guests per item
  const itemMap = new Map<
    string,
    {
      name: string;
      category: string | null;
      section: string;
      clickCount: number;
      totalClicks: number;
      guests: Set<string>;
      totalDuration: number;
      guestDurations: Map<string, number[]>;
    }
  >();

  interactions.forEach((interaction) => {
    if (interaction.item_id && interaction.item_name) {
      const existing = itemMap.get(interaction.item_id);
      if (existing) {
        // Count total interactions
        existing.totalClicks += 1;

        // Count clicks (ignore other action types for click count)
        if (interaction.action_type === "click") {
          existing.clickCount += 1;
        }

        // Track unique guests
        existing.guests.add(interaction.guest_id);

        // Track duration per guest for better averaging
        if (interaction.duration_seconds && interaction.duration_seconds > 0) {
          const guestDurations =
            existing.guestDurations.get(interaction.guest_id) || [];
          guestDurations.push(interaction.duration_seconds);
          existing.guestDurations.set(interaction.guest_id, guestDurations);
          existing.totalDuration += interaction.duration_seconds;
        }
      } else {
        const guestDurations = new Map<string, number[]>();
        if (interaction.duration_seconds && interaction.duration_seconds > 0) {
          guestDurations.set(interaction.guest_id, [
            interaction.duration_seconds,
          ]);
        }

        itemMap.set(interaction.item_id, {
          name: interaction.item_name,
          category: interaction.item_category || null,
          section: interaction.section_type,
          clickCount: interaction.action_type === "click" ? 1 : 0,
          totalClicks: 1,
          guests: new Set([interaction.guest_id]),
          totalDuration: interaction.duration_seconds || 0,
          guestDurations,
        });
      }
    }
  });

  // Convert to array and sort by click count descending
  const popular: PopularItem[] = Array.from(itemMap.entries()).map(
    ([itemId, data]) => ({
      itemId,
      itemName: data.name,
      itemCategory: data.category,
      sectionType: data.section,
      interactionCount: data.clickCount, // Total clicks
      uniqueGuests: data.guests.size, // Number of unique guests who clicked
      avgTimeSpent:
        data.totalDuration > 0 && data.clickCount > 0
          ? Math.floor(data.totalDuration / data.clickCount)
          : 0,
    })
  );

  popular.sort((a, b) => b.interactionCount - a.interactionCount);

  console.log("📊 Popular items calculated:", popular.length);

  // Return top 50 items (increased from 10 to show all items per section)
  return popular.slice(0, 50);
}
