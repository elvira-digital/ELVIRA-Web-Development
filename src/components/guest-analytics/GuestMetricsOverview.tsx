/**
 * Guest Dashboard Behavior Overview Component
 *
 * Displays guest dashboard behavior metrics: sessions and time spent
 */

import {
  AnalyticsMetricCard,
  AnalyticsMetricsGrid,
} from "../web-analytics/cards";
import { formatDuration } from "../web-analytics/utils/formatters";
import type { GuestBehaviorMetrics } from "../../types/guest-analytics";

interface GuestMetricsOverviewProps {
  behaviorData: GuestBehaviorMetrics | null;
  isLoading?: boolean;
}

export function GuestMetricsOverview({
  behaviorData,
  isLoading = false,
}: GuestMetricsOverviewProps) {
  return (
    <AnalyticsMetricsGrid columns={2}>
      <AnalyticsMetricCard
        title="Total Sessions"
        value={behaviorData?.totalSessions || 0}
        subtitle="Guest dashboard sessions"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
        color="emerald"
        isLoading={isLoading}
      />

      <AnalyticsMetricCard
        title="Avg Session Duration"
        value={
          behaviorData ? formatDuration(behaviorData.avgSessionDuration) : "0s"
        }
        subtitle="Time spent per session"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        color="amber"
        isLoading={isLoading}
      />
    </AnalyticsMetricsGrid>
  );
}
