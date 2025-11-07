/**
 * Web Analytics Types
 *
 * Simple analytics interfaces for the ELVIRA Hotel Management System.
 */

export interface AnalyticsMetrics {
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface AnalyticsQueryOptions {
  hotelId?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}
