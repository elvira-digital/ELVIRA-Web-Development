/**
 * Analytics Metrics Grid
 *
 * A grid container for displaying multiple analytics metric cards
 * with responsive layout and consistent spacing.
 */

import type { ReactNode } from "react";

interface AnalyticsMetricsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function AnalyticsMetricsGrid({
  children,
  columns = 4,
}: AnalyticsMetricsGridProps) {
  const gridClasses = {
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={`grid ${gridClasses[columns]} gap-6`}>{children}</div>;
}
