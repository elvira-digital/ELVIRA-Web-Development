/**
 * Traffic Sources Hook
 *
 * Custom hooks for fetching traffic sources and referral data.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchTrafficSources,
  fetchSocialTraffic,
  fetchReferralTraffic,
  fetchCompleteTrafficReport,
} from "../../services/web-analytics/trafficService";
import type { AnalyticsQueryOptions } from "../../types/web-analytics/common";

/**
 * Hook for fetching traffic sources data
 */
export function useTrafficSources({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["traffic-sources", hotelId, startDate, endDate],
    queryFn: () => fetchTrafficSources(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching social media traffic data
 */
export function useSocialTraffic({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["social-traffic", hotelId, startDate, endDate],
    queryFn: () => fetchSocialTraffic(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching referral traffic data
 */
export function useReferralTraffic({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["referral-traffic", hotelId, startDate, endDate],
    queryFn: () => fetchReferralTraffic(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching complete traffic sources report
 */
export function useCompleteTrafficReport({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["complete-traffic-report", hotelId, startDate, endDate],
    queryFn: () => fetchCompleteTrafficReport(startDate, endDate, hotelId),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes for complete report
    retry: 2,
  });
}
