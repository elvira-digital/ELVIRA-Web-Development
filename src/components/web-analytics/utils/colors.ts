/**
 * Analytics Color Utilities
 *
 * Color schemes and utilities for analytics visualizations.
 */

/**
 * Analytics-specific color palette
 */
export const ANALYTICS_COLORS = {
  // Metric colors
  users: "#3b82f6", // Blue
  sessions: "#10b981", // Emerald
  pageViews: "#8b5cf6", // Purple
  bounceRate: "#f59e0b", // Amber

  // Traffic source colors
  organic: "#22c55e", // Green
  direct: "#6b7280", // Gray
  social: "#ec4899", // Pink
  referral: "#8b5cf6", // Purple
  email: "#06b6d4", // Cyan
  paid: "#f59e0b", // Amber

  // Device colors
  mobile: "#10b981", // Emerald
  desktop: "#3b82f6", // Blue
  tablet: "#f59e0b", // Amber

  // Status colors
  good: "#10b981", // Green
  average: "#f59e0b", // Amber
  poor: "#ef4444", // Red

  // Chart colors (for multi-series charts)
  chart: [
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
  ],
} as const;

/**
 * Get color for bounce rate based on value
 */
export function getBounceRateColor(bounceRate: number): string {
  if (bounceRate <= 25) return ANALYTICS_COLORS.good;
  if (bounceRate <= 40) return ANALYTICS_COLORS.average;
  return ANALYTICS_COLORS.poor;
}

/**
 * Get color for traffic source
 */
export function getTrafficSourceColor(source: string, medium: string): string {
  if (medium === "organic") return ANALYTICS_COLORS.organic;
  if (medium === "(none)" || source === "direct")
    return ANALYTICS_COLORS.direct;
  if (medium === "social") return ANALYTICS_COLORS.social;
  if (medium === "referral") return ANALYTICS_COLORS.referral;
  if (medium === "email") return ANALYTICS_COLORS.email;
  if (medium === "cpc" || medium === "ppc") return ANALYTICS_COLORS.paid;

  // Default color for unknown sources
  return ANALYTICS_COLORS.chart[0];
}

/**
 * Get color for device category
 */
export function getDeviceColor(device: string): string {
  switch (device.toLowerCase()) {
    case "mobile":
      return ANALYTICS_COLORS.mobile;
    case "desktop":
      return ANALYTICS_COLORS.desktop;
    case "tablet":
      return ANALYTICS_COLORS.tablet;
    default:
      return ANALYTICS_COLORS.chart[0];
  }
}

/**
 * Generate color palette for chart data
 */
export function generateChartColors(count: number): string[] {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(ANALYTICS_COLORS.chart[i % ANALYTICS_COLORS.chart.length]);
  }
  return colors;
}

/**
 * Get trend color based on change value and metric type
 */
export function getTrendColor(
  change: number,
  metricType: "good-up" | "good-down" = "good-up"
): string {
  if (change === 0) return ANALYTICS_COLORS.average;

  if (metricType === "good-up") {
    return change > 0 ? ANALYTICS_COLORS.good : ANALYTICS_COLORS.poor;
  } else {
    // For metrics where lower is better (like bounce rate)
    return change < 0 ? ANALYTICS_COLORS.good : ANALYTICS_COLORS.poor;
  }
}
