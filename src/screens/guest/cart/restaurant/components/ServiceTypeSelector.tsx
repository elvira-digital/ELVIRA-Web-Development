/**
 * Service Type Selector Component
 *
 * Allows user to select between Restaurant or Room Service
 */

import React from "react";

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
  if (availableTypes.length <= 1) {
    return null; // Don't show selector if only one type available
  }

  return (
    <div className="mb-4 sm:mb-6">
      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
        Service Type
      </label>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {availableTypes.includes("Restaurant") && (
          <button
            type="button"
            onClick={() => onTypeChange("Restaurant")}
            className={`px-3 py-2 sm:px-4 sm:py-3 rounded-full border-2 text-xs sm:text-sm font-medium transition-all ${
              selectedType === "Restaurant"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            Restaurant
          </button>
        )}
        {availableTypes.includes("Room Service") && (
          <button
            type="button"
            onClick={() => onTypeChange("Room Service")}
            className={`px-3 py-2 sm:px-4 sm:py-3 rounded-full border-2 text-xs sm:text-sm font-medium transition-all ${
              selectedType === "Room Service"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            Room Service
          </button>
        )}
      </div>
    </div>
  );
};
