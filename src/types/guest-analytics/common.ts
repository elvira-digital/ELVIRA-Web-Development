/**
 * Common types for Guest Analytics
 *
 * Shared interfaces and types used across guest behavior analytics
 */

export type DateRange = "7daysAgo" | "30daysAgo" | "90daysAgo";

export interface Trend {
  change: number; // Percentage change
  period: string; // e.g., "vs last period"
  isPositive?: boolean; // Whether positive change is good
}

export interface BaseAnalyticsData {
  hotelId?: string;
  dateRange: DateRange;
  lastUpdated: Date;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}
