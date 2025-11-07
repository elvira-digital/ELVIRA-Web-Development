/**
 * Analytics Section Card
 *
 * A container card for grouping related analytics content
 * with optional header, actions, and loading state.
 */

import type { ReactNode } from "react";

interface AnalyticsSectionCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function AnalyticsSectionCard({
  title,
  subtitle,
  icon,
  children,
  actions,
  isLoading = false,
  className = "",
}: AnalyticsSectionCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="w-5 h-5 text-gray-600">{icon}</div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {actions && !isLoading && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
