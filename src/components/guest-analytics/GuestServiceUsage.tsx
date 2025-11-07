/**
 * Guest Dashboard Sections Component
 *
 * Displays time spent and clicks for each dashboard section with expandable item details
 */

import { useState } from "react";
import { AnalyticsSectionCard } from "../web-analytics/cards";
import { formatDuration } from "../web-analytics/utils/formatters";
import type { GuestBehaviorMetrics } from "../../types/guest-analytics";

interface GuestServiceUsageProps {
  behaviorData: GuestBehaviorMetrics | null;
  isLoading?: boolean;
}

export function GuestServiceUsage({
  behaviorData,
  isLoading = false,
}: GuestServiceUsageProps) {
  const sections = behaviorData?.sections || [];
  const allItems = behaviorData?.mostPopularItems || [];
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Get items for a specific section
  const getItemsForSection = (sectionId: string) => {
    return allItems.filter((item) => item.sectionType === sectionId);
  };

  // Calculate aggregated stats for items in a section
  const getItemStats = (sectionId: string) => {
    const items = getItemsForSection(sectionId);
    return items.reduce(
      (acc, item) => ({
        totalClicks: acc.totalClicks + item.interactionCount,
        totalVisitors: acc.totalVisitors + item.uniqueGuests,
        totalTime: acc.totalTime + item.avgTimeSpent * item.interactionCount,
        itemCount: acc.itemCount + 1,
      }),
      { totalClicks: 0, totalVisitors: 0, totalTime: 0, itemCount: 0 }
    );
  };

  return (
    <AnalyticsSectionCard
      title="Dashboard Section Behavior"
      subtitle="Time spent and clicks in each dashboard section. Click to expand and see item details."
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      }
      isLoading={isLoading}
    >
      {sections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No guest behavior data available yet.</p>
          <p className="text-xs mt-1">
            Data will appear once guests start using the dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const isExpanded = expandedSection === section.sectionId;
            const sectionItems = getItemsForSection(section.sectionId);
            const itemStats = getItemStats(section.sectionId);

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Section Header - Clickable */}
                <button
                  onClick={() => toggleSection(section.sectionId)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-700">
                        {section.sectionName}
                      </p>
                      {sectionItems.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          {sectionItems.length}{" "}
                          {sectionItems.length === 1 ? "item" : "items"}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    <div className="flex gap-4 mt-1">
                      {itemStats.itemCount > 0 ? (
                        <>
                          <span className="text-xs text-gray-500">
                            Time: {formatDuration(itemStats.totalTime)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Clicks: {itemStats.totalClicks}
                          </span>
                          <span className="text-xs text-gray-500">
                            Visitors: {itemStats.totalVisitors}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-gray-500">
                            Time: {formatDuration(section.timeSpent)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Clicks: {section.clickCount}
                          </span>
                          <span className="text-xs text-gray-500">
                            Visits: {section.visitCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      {section.avgTimePerVisit > 0
                        ? formatDuration(section.avgTimePerVisit)
                        : "0s"}
                    </p>
                    <p className="text-xs text-gray-500">avg per visit</p>
                  </div>
                </button>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="p-3 bg-white border-t border-gray-200">
                    {sectionItems.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No specific item interactions recorded yet for this
                        section.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          Most Clicked Items:
                        </p>
                        {sectionItems.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shrink-0">
                                {itemIndex + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {item.itemName}
                                </p>
                                {item.itemCategory && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {item.itemCategory}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-3 shrink-0">
                              <div className="text-right">
                                <p className="text-xs font-semibold text-emerald-700">
                                  {item.interactionCount}
                                </p>
                                <p className="text-xs text-gray-500">clicks</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-blue-700">
                                  {item.uniqueGuests}
                                </p>
                                <p className="text-xs text-gray-500">
                                  visitors
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-semibold text-purple-700">
                                  {item.avgTimeSpent > 0
                                    ? formatDuration(item.avgTimeSpent)
                                    : "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">time</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AnalyticsSectionCard>
  );
}
