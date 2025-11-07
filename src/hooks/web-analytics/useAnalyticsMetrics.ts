/**
 * Analytics Metrics Hook
 *
 * Custom hooks for fetching web analytics metrics data.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsMetrics,
  fetchTimeSeriesMetrics,
  fetchMetricsComparison,
} from "../../services/web-analytics/metricsService";
import type { AnalyticsQueryOptions } from "../../types/web-analytics/common";

/**
 * Hook for fetching basic analytics metrics
 */
export function useAnalyticsMetrics({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["analytics-metrics", hotelId, startDate, endDate],
    queryFn: () => fetchAnalyticsMetrics(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching time series metrics data
 */
export function useTimeSeriesMetrics({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["time-series-metrics", hotelId, startDate, endDate],
    queryFn: () => fetchTimeSeriesMetrics(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching metrics comparison between periods
 */
export function useMetricsComparison({
  currentStartDate,
  currentEndDate,
  previousStartDate,
  previousEndDate,
  hotelId,
  enabled = true,
}: {
  currentStartDate: string;
  currentEndDate: string;
  previousStartDate: string;
  previousEndDate: string;
  hotelId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      "metrics-comparison",
      hotelId,
      currentStartDate,
      currentEndDate,
      previousStartDate,
      previousEndDate,
    ],
    queryFn: () =>
      fetchMetricsComparison(
        currentStartDate,
        currentEndDate,
        previousStartDate,
        previousEndDate,
        hotelId
      ),
    enabled: enabled && !!currentStartDate && !!previousStartDate,
    staleTime: 10 * 60 * 1000, // 10 minutes for comparison data
    retry: 2,
  });
}
