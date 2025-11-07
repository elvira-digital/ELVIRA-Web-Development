/**
 * Common Web Analytics Types
 *
 * Shared interfaces and types used across all analytics modules.
 */

/**
 * Date range for analytics queries
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Analytics query options
 */
export interface AnalyticsQueryOptions {
  hotelId?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

/**
 * Hotel filter for analytics data
 */
export interface HotelFilter {
  hotelId?: string;
}

/**
 * Generic analytics response wrapper
 */
export interface AnalyticsResponse<T> {
  data: T;
  dateRange: DateRange;
  hotelId?: string;
  lastUpdated: string;
}

/**
 * Error response for analytics API calls
 */
export interface AnalyticsError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Loading state for analytics data
 */
export type AnalyticsLoadingState = "idle" | "loading" | "success" | "error";
