/**
 * Guest Dashboard Analytics Section
 *
 * This component displays analytics for guest behavior within the ELVIRA Guest Dashboard.
 * It tracks how authenticated guests interact with hotel services, features, and digital touchpoints.
 * Access requires room + verification code authentication.
 */

import { useState } from "react";
import {
  GuestMetricsOverview,
  GuestServiceUsage,
} from "../../../../components/guest-analytics";
import { useGuestMetrics } from "../../../../hooks/guest-analytics";
import type { DateRange } from "../../../../types/guest-analytics";

interface WebAnalyticsSectionProps {
  hotelId: string | undefined;
}

export function WebAnalyticsSection({ hotelId }: WebAnalyticsSectionProps) {
  const [dateRange, setDateRange] = useState<DateRange>("30daysAgo");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use guest analytics hooks
  const {
    behaviorData,
    isLoading: metricsLoading,
    refresh: refreshMetrics,
  } = useGuestMetrics(hotelId);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMetrics();
    setIsRefreshing(false);
  };

  const getDateRangeLabel = (range: DateRange) => {
    switch (range) {
      case "7daysAgo":
        return "Last 7 days";
      case "30daysAgo":
        return "Last 30 days";
      case "90daysAgo":
        return "Last 90 days";
    }
  };

  const isLoading = metricsLoading || isRefreshing;

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Guest Dashboard Analytics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Guest behavior analytics for authenticated dashboard users •{" "}
            {getDateRangeLabel(dateRange)}
          </p>
        </div>

        <div className="flex gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="7daysAgo">Last 7 days</option>
            <option value="30daysAgo">Last 30 days</option>
            <option value="90daysAgo">Last 90 days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Guest Metrics Overview */}
      <GuestMetricsOverview behaviorData={behaviorData} isLoading={isLoading} />

      {/* Guest Dashboard Sections with expandable items */}
      <GuestServiceUsage behaviorData={behaviorData} isLoading={isLoading} />

      {/* Status Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
        <div className="flex gap-4">
          <svg
            className="w-6 h-6 text-emerald-600 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              Guest Dashboard Analytics Ready
            </h3>
            <p className="text-sm text-emerald-800 mb-2">
              Tracking authenticated guest behavior within the hotel dashboard.
              Analytics focus on service usage, session patterns, and feature
              adoption for {hotelId ? "this hotel" : "all hotels"}.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-emerald-700">
              <span>✓ Guest Session Tracking</span>
              <span>✓ Service Usage Analytics</span>
              <span>✓ Feature Adoption Metrics</span>
              <span>✓ Real-time Dashboard</span>
              <span>✓ Hotel-specific Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
