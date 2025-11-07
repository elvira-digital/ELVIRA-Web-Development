/**
 * Demographics Analytics Hook
 *
 * Custom hooks for fetching user demographics and device data.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchGeographicData,
  fetchCityData,
  fetchDeviceData,
  fetchBrowserData,
  fetchOperatingSystemData,
  fetchCompleteDemographicsReport,
} from "../../services/web-analytics/demographicsService";
import type { AnalyticsQueryOptions } from "../../types/web-analytics/common";

/**
 * Hook for fetching geographic data (countries)
 */
export function useGeographicData({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["geographic-data", hotelId, startDate, endDate],
    queryFn: () => fetchGeographicData(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching city-level data
 */
export function useCityData({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["city-data", hotelId, startDate, endDate],
    queryFn: () => fetchCityData(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching device category data
 */
export function useDeviceData({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["device-data", hotelId, startDate, endDate],
    queryFn: () => fetchDeviceData(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching browser data
 */
export function useBrowserData({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["browser-data", hotelId, startDate, endDate],
    queryFn: () => fetchBrowserData(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching operating system data
 */
export function useOperatingSystemData({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["operating-system-data", hotelId, startDate, endDate],
    queryFn: () => fetchOperatingSystemData(startDate, endDate, hotelId),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for fetching complete demographics report
 */
export function useCompleteDemographicsReport({
  hotelId,
  startDate = "30daysAgo",
  endDate = "today",
  enabled = true,
}: AnalyticsQueryOptions = {}) {
  return useQuery({
    queryKey: ["complete-demographics-report", hotelId, startDate, endDate],
    queryFn: () => fetchCompleteDemographicsReport(startDate, endDate, hotelId),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes for complete report
    retry: 2,
  });
}
