import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MapLegendItem {
  label: string;
  color: string;
  icon: "circle" | "star" | "pin";
}

interface MapLegendOverlayProps {
  items: MapLegendItem[];
  title?: string;
}

export const MapLegendOverlay: React.FC<MapLegendOverlayProps> = ({
  items,
  title = "Map Legend",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-10 pointer-events-none">
      <div className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all duration-200">
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-2 flex items-center justify-between text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-t-lg transition-colors"
        >
          <span>{title}</span>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        {/* Legend Content */}
        {!isCollapsed && (
          <div className="px-4 pb-3">
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {item.icon === "star" ? (
                    <svg
                      className="w-4 h-4"
                      style={{ color: item.color }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : item.icon === "pin" ? (
                    <svg
                      className="w-4 h-4"
                      style={{ color: item.color }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  <span className="text-xs text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
