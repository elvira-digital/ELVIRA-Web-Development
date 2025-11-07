/**
 * Analytics Metric Card
 *
 * A focused card component for displaying individual analytics metrics
 * with trend indicators and formatted values.
 */

import type { ReactNode } from "react";
import {
  formatNumber,
  formatPercentageChange,
  getTrendIndicator,
} from "../utils/formatters";

interface AnalyticsMetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    change: number;
    period: string;
  };
  color: "blue" | "emerald" | "purple" | "amber" | "red";
  isLoading?: boolean;
}

const colorClasses = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-200",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "border-emerald-200",
  },
  purple: {
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    border: "border-purple-200",
  },
  amber: {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    border: "border-amber-200",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    border: "border-red-200",
  },
} as const;

export function AnalyticsMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  isLoading = false,
}: AnalyticsMetricCardProps) {
  const colors = colorClasses[color];
  const formattedValue =
    typeof value === "number" ? formatNumber(value) : value;

  const trendInfo = trend ? getTrendIndicator(trend.change) : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className={`p-3 ${colors.iconBg} rounded-lg`}>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border ${colors.border} p-6 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formattedValue}
          </p>

          {/* Subtitle or Trend */}
          {subtitle && !trend && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}

          {trend && trendInfo && (
            <div className="flex items-center gap-1">
              <div className={`flex items-center ${trendInfo.color}`}>
                {trendInfo.icon === "arrow-up" && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17l9.2-9.2M17 17V7H7"
                    />
                  </svg>
                )}
                {trendInfo.icon === "arrow-down" && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 7l-9.2 9.2M7 7v10h10"
                    />
                  </svg>
                )}
                {trendInfo.icon === "minus" && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                )}
                <span className="text-xs font-medium">
                  {formatPercentageChange(trend.change)}
                </span>
              </div>
              <span className="text-xs text-gray-500">vs {trend.period}</span>
            </div>
          )}
        </div>

        <div className={`p-3 ${colors.iconBg} rounded-lg`}>
          <div className={colors.iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
