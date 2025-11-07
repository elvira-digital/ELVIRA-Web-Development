/**
 * Guest Popular Items Component
 *
 * Displays most clicked items across all dashboard sections
 */

import { AnalyticsSectionCard } from "../web-analytics/cards";
import { formatDuration } from "../web-analytics/utils/formatters";
import type { GuestBehaviorMetrics } from "../../types/guest-analytics";

interface GuestPopularItemsProps {
  behaviorData: GuestBehaviorMetrics | null;
  isLoading?: boolean;
}

export function GuestPopularItems({
  behaviorData,
  isLoading = false,
}: GuestPopularItemsProps) {
  const items = behaviorData?.mostPopularItems || [];

  return (
    <AnalyticsSectionCard
      title="Most Popular Items"
      subtitle="Specific amenities, products, and menu items guests interact with most"
      icon={
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      }
      isLoading={isLoading}
    >
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No item interaction data available yet.</p>
          <p className="text-xs mt-1">
            Data will appear once guests start clicking on items.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    #{index + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-700">
                    {item.itemName}
                  </p>
                </div>
                <div className="flex gap-4 mt-1 ml-8">
                  {item.itemCategory && (
                    <span className="text-xs text-gray-500">
                      Category: {item.itemCategory}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {item.uniqueGuests}{" "}
                    {item.uniqueGuests === 1 ? "guest" : "guests"}
                  </span>
                  {item.avgTimeSpent > 0 && (
                    <span className="text-xs text-gray-500">
                      Avg time: {formatDuration(item.avgTimeSpent)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="text-sm font-medium text-emerald-700">
                  {item.interactionCount}{" "}
                  {item.interactionCount === 1 ? "click" : "clicks"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AnalyticsSectionCard>
  );
}
