/**
 * Analytics Formatting Utilities
 *
 * Utility functions for formatting analytics data for display.
 */

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Format duration in seconds to readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format bounce rate with appropriate color indication
 */
export function formatBounceRate(bounceRate: number): {
  value: string;
  color: "good" | "average" | "poor";
} {
  const formatted = formatPercentage(bounceRate);

  let color: "good" | "average" | "poor";
  if (bounceRate <= 25) {
    color = "good";
  } else if (bounceRate <= 40) {
    color = "average";
  } else {
    color = "poor";
  }

  return { value: formatted, color };
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage change with sign
 */
export function formatPercentageChange(
  change: number,
  decimals: number = 1
): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(decimals)}%`;
}

/**
 * Get trend indicator based on percentage change
 */
export function getTrendIndicator(change: number): {
  type: "up" | "down" | "neutral";
  color: string;
  icon: "arrow-up" | "arrow-down" | "minus";
} {
  if (change > 0) {
    return {
      type: "up",
      color: "text-emerald-600",
      icon: "arrow-up",
    };
  } else if (change < 0) {
    return {
      type: "down",
      color: "text-red-600",
      icon: "arrow-down",
    };
  } else {
    return {
      type: "neutral",
      color: "text-gray-600",
      icon: "minus",
    };
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
