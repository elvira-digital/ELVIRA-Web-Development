/**
 * Service Type Selector Component
 *
 * Allows user to select between Restaurant or Room Service
 */

import React from "react";
import { useGuestTheme } from "../../../../../contexts/guest";

interface ServiceTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  availableTypes: string[];
}

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  availableTypes,
}) => {
  const { theme } = useGuestTheme();

  if (availableTypes.length <= 1) {
    return null; // Don't show selector if only one type available
  }

  return (
    <div className="mb-4 sm:mb-6">
      <label
        className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
        style={{
          color: theme.color_text_primary,
          fontFamily: theme.font_family,
        }}
      >
        Service Type
      </label>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {availableTypes.includes("Restaurant") && (
          <button
            type="button"
            onClick={() => onTypeChange("Restaurant")}
            className="px-3 py-2 sm:px-4 sm:py-3 border-2 text-xs sm:text-sm font-medium transition-all"
            style={{
              borderRadius: theme.button_border_radius,
              borderColor:
                selectedType === "Restaurant" ? theme.color_primary : "#e5e7eb",
              backgroundColor:
                selectedType === "Restaurant"
                  ? `${theme.color_primary}15`
                  : "white",
              color:
                selectedType === "Restaurant"
                  ? theme.color_primary
                  : theme.color_text_primary,
              fontFamily: theme.font_family,
            }}
          >
            Restaurant
          </button>
        )}
        {availableTypes.includes("Room Service") && (
          <button
            type="button"
            onClick={() => onTypeChange("Room Service")}
            className="px-3 py-2 sm:px-4 sm:py-3 border-2 text-xs sm:text-sm font-medium transition-all"
            style={{
              borderRadius: theme.button_border_radius,
              borderColor:
                selectedType === "Room Service"
                  ? theme.color_primary
                  : "#e5e7eb",
              backgroundColor:
                selectedType === "Room Service"
                  ? `${theme.color_primary}15`
                  : "white",
              color:
                selectedType === "Room Service"
                  ? theme.color_primary
                  : theme.color_text_primary,
              fontFamily: theme.font_family,
            }}
          >
            Room Service
          </button>
        )}
      </div>
    </div>
  );
};
