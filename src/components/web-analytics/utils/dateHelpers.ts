/**
 * Analytics Date Utilities
 *
 * Utility functions for working with dates in analytics data.
 */

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date for charts (shorter format)
 */
export function formatChartDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get date range label for display
 */
export function getDateRangeLabel(startDate: string, endDate: string): string {
  if (startDate === "7daysAgo" && endDate === "today") {
    return "Last 7 days";
  }
  if (startDate === "30daysAgo" && endDate === "today") {
    return "Last 30 days";
  }
  if (startDate === "90daysAgo" && endDate === "today") {
    return "Last 90 days";
  }

  // Custom date range
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Calculate previous period dates for comparison
 */
export function getPreviousPeriodDates(
  startDate: string,
  endDate: string
): {
  previousStartDate: string;
  previousEndDate: string;
} {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const periodLength = end.getTime() - start.getTime();

  const previousEnd = new Date(start.getTime() - 1); // Day before start
  const previousStart = new Date(previousEnd.getTime() - periodLength);

  return {
    previousStartDate: previousStart.toISOString().split("T")[0],
    previousEndDate: previousEnd.toISOString().split("T")[0],
  };
}

/**
 * Check if a date range is valid
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return start <= end && end <= new Date();
}

/**
 * Get relative date string for GA4 API
 */
export function getRelativeDateString(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}daysAgo`;
}
