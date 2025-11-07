/**
 * Real-time Guest Tracking Service
 *
 * Tracks actual guest interactions and stores them for immediate display
 */

import type {
  GuestInteraction,
  GuestBehaviorMetrics,
  GuestDashboardSection,
} from "../../types/guest-analytics";

const STORAGE_KEY = "guest_behavior_data";
const SESSION_START_KEY = "guest_session_start";

// Map routes to section IDs
const routeToSectionMap: Record<string, string> = {
  "/guest/home": "home",
  "/guest/amenities": "amenities",
  "/guest/services": "amenities",
  "/guest/restaurant": "restaurant",
  "/guest/shop": "shop",
  "/guest/laundry": "laundry",
  "/guest/places": "places",
  "/guest/tours": "tours",
  "/guest/wellness": "wellness",
  "/guest/gastronomy": "gastronomy",
  "/guest/to-visit": "places",
  "/guest/qa": "qa",
};

interface StoredBehaviorData {
  totalSessions: number;
  sessionStartTime?: number;
  currentSessionDuration: number;
  sections: Record<
    string,
    {
      timeSpent: number;
      clickCount: number;
      visitCount: number;
      lastVisitStart?: number;
    }
  >;
}

// Get current stored data
function getStoredData(): StoredBehaviorData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to parse stored behavior data:", e);
    }
  }

  // Initialize default data
  return {
    totalSessions: 0,
    currentSessionDuration: 0,
    sections: {
      home: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      amenities: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      restaurant: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      shop: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      laundry: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      places: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      tours: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      wellness: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      gastronomy: { timeSpent: 0, clickCount: 0, visitCount: 0 },
      qa: { timeSpent: 0, clickCount: 0, visitCount: 0 },
    },
  };
}

// Save data to storage
function saveData(data: StoredBehaviorData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Initialize session tracking
export function initializeSession() {
  const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
  if (!sessionStart) {
    sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());

    // Increment session count
    const data = getStoredData();
    data.totalSessions += 1;
    saveData(data);
  }
}

// Track page/section visit
export function trackSectionVisit(route: string) {
  const sectionId = routeToSectionMap[route];
  if (!sectionId) return;

  const data = getStoredData();
  const section = data.sections[sectionId];

  // End previous section visit if any
  endCurrentSectionVisit();

  // Start new section visit
  section.visitCount += 1;
  section.lastVisitStart = Date.now();

  saveData(data);

  // Store current section for time tracking
  sessionStorage.setItem("current_section", sectionId);
}

// Track click in current section
export function trackClick(route: string) {
  const sectionId = routeToSectionMap[route];
  if (!sectionId) return;

  const data = getStoredData();
  data.sections[sectionId].clickCount += 1;
  saveData(data);
}

// End current section visit (calculate time spent)
export function endCurrentSectionVisit() {
  const currentSection = sessionStorage.getItem("current_section");
  if (!currentSection) return;

  const data = getStoredData();
  const section = data.sections[currentSection];

  if (section.lastVisitStart) {
    const timeSpent = Math.floor((Date.now() - section.lastVisitStart) / 1000);
    section.timeSpent += timeSpent;
    delete section.lastVisitStart;
    saveData(data);
  }

  sessionStorage.removeItem("current_section");
}

// Get behavior metrics for display
export function getBehaviorMetrics(): GuestBehaviorMetrics {
  // End current section to get accurate time
  endCurrentSectionVisit();

  const data = getStoredData();

  // Calculate session duration
  const sessionStart = parseInt(
    sessionStorage.getItem(SESSION_START_KEY) || "0"
  );
  const currentSessionDuration = sessionStart
    ? Math.floor((Date.now() - sessionStart) / 1000)
    : 0;

  const sections: GuestDashboardSection[] = Object.entries(data.sections).map(
    ([sectionId, sectionData]) => ({
      sectionId,
      sectionName: getSectionName(sectionId),
      timeSpent: sectionData.timeSpent,
      clickCount: sectionData.clickCount,
      visitCount: sectionData.visitCount,
      avgTimePerVisit:
        sectionData.visitCount > 0
          ? Math.floor(sectionData.timeSpent / sectionData.visitCount)
          : 0,
    })
  );

  // Calculate average session duration
  const avgSessionDuration =
    data.totalSessions > 0
      ? Math.floor(
          (data.currentSessionDuration + currentSessionDuration) /
            data.totalSessions
        )
      : currentSessionDuration;

  return {
    totalSessions: data.totalSessions,
    avgSessionDuration,
    sections,
  };
}

// Helper to get display name for section
function getSectionName(sectionId: string): string {
  const names: Record<string, string> = {
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
  };
  return names[sectionId] || sectionId;
}

// Clear all tracking data (for testing)
export function clearTrackingData() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_START_KEY);
  sessionStorage.removeItem("current_section");
}
