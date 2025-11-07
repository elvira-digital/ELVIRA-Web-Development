/**
 * Guest Dashboard Behavior Tracking Types
 *
 * TypeScript interfaces for tracking guest behavior within the dashboard
 */

export interface GuestDashboardSection {
  sectionId: string; // 'home', 'amenities', 'restaurant', 'shop', etc.
  sectionName: string; // Display name
  timeSpent: number; // Total seconds spent in this section
  clickCount: number; // Total clicks/interactions in this section
  visitCount: number; // Number of times this section was visited
  avgTimePerVisit: number; // Average seconds per visit
  topItems?: PopularItem[]; // Most interacted items in this section
}

export interface PopularItem {
  itemId: string | null;
  itemName: string;
  itemCategory: string | null;
  sectionType: string; // Which section this item belongs to
  interactionCount: number;
  uniqueGuests: number;
  avgTimeSpent: number; // Average seconds spent on this item
  orderCount?: number; // For items that can be ordered
}

export interface GuestBehaviorMetrics {
  totalSessions: number; // Total guest sessions recorded
  avgSessionDuration: number; // Average session duration in seconds
  sections: GuestDashboardSection[]; // Behavior data for each dashboard section
  mostPopularItems: PopularItem[]; // Top items across all sections
}
