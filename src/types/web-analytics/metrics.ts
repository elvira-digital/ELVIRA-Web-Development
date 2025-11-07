/**
 * Analytics Metrics Types
 *
 * Types for core web analytics metrics like users, sessions, page views, etc.
 */

import type { DateRange } from "./common";

/**
 * Core analytics metrics
 */
export interface AnalyticsMetrics {
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

/**
 * Detailed metrics with additional context
 */
export interface DetailedMetrics extends AnalyticsMetrics {
  returningUsers: number;
  sessionsPerUser: number;
  pageViewsPerSession: number;
  conversionRate?: number;
}

/**
 * Metrics dimension data (for time series, etc.)
 */
export interface MetricsDimension {
  date?: string;
  hour?: string;
  dayOfWeek?: string;
  country?: string;
  city?: string;
  deviceCategory?: string;
  hotelId?: string;
}

/**
 * Complete metrics report
 */
export interface MetricsReport {
  metrics: AnalyticsMetrics;
  dimensions: MetricsDimension[];
  dateRange: DateRange;
  totalRows?: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
}

/**
 * Comparison metrics (current vs previous period)
 */
export interface MetricsComparison {
  current: AnalyticsMetrics;
  previous: AnalyticsMetrics;
  changes: {
    users: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  percentageChanges: {
    users: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
}
