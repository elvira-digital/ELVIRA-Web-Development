/**
 * Pages Analytics Hook
 *
 * Custom hooks for fetching page-related analytics data.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchTopPages,
  fetchLandingPages,
  fetchExitPages,
  fetchSiteSearchData,
  fetchCompletePageReport,
} from "../../services/web-analytics/pagesService";
import type { AnalyticsQueryOptions } from "../../types/web-analytics/common";

/**
 * Hook for fetching top pages data
 */
export function useTopPages({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["top-pages", hotelId, startDate, endDate],
    queryFn: () => fetchTopPages(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching landing pages data
 */
export function useLandingPages({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["landing-pages", hotelId, startDate, endDate],
    queryFn: () => fetchLandingPages(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching exit pages data
 */
export function useExitPages({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["exit-pages", hotelId, startDate, endDate],
    queryFn: () => fetchExitPages(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching site search data
 */
export function useSiteSearchData({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["site-search", hotelId, startDate, endDate],
    queryFn: () => fetchSiteSearchData(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching complete pages report
 */
export function useCompletePageReport({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["complete-page-report", hotelId, startDate, endDate],
    queryFn: () => fetchCompletePageReport(startDate, endDate, hotelId),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes for complete report
    retry: 2,
  });
}
