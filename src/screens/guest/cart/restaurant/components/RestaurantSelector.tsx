/**
 * Restaurant Selector Component
 *
 * Allows user to select which restaurant to book when multiple restaurants are available
 * Only shown when service type is "Restaurant" and there are multiple restaurant options
 */

import React from "react";
import { UtensilsCrossed } from "lucide-react";
import { useGuestTheme } from "../../../../../contexts/guest";

interface RestaurantSelectorProps {
  selectedRestaurantId: string | null;
  onRestaurantChange: (restaurantId: string) => void;
  availableRestaurants: Array<{ id: string; name: string }>;
}

export const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({
  selectedRestaurantId,
  onRestaurantChange,
  availableRestaurants,
}) => {
  const { theme } = useGuestTheme();

  if (availableRestaurants.length === 0) {
    return null; // Don't show if no restaurants
  }

  // If only one restaurant, auto-select it and show non-editable
  if (availableRestaurants.length === 1) {
    return (
      <div className="mb-4 sm:mb-6">
        <label
          className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
          style={{
            color: theme.color_text_primary,
            fontFamily: theme.font_family,
          }}
        >
          Restaurant
        </label>
        <div
          className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 border-2"
          style={{
            backgroundColor: `${theme.color_primary}15`,
            borderColor: theme.color_primary,
            borderRadius: theme.button_border_radius,
          }}
        >
          <UtensilsCrossed
            className="w-4 h-4 sm:w-5 sm:h-5"
            style={{ color: theme.color_primary }}
          />
          <span
            className="text-xs sm:text-sm font-medium"
            style={{
              color: theme.color_primary,
              fontFamily: theme.font_family,
            }}
          >
            {availableRestaurants[0].name}
          </span>
        </div>
      </div>
    );
  }

  // Multiple restaurants - show selector
  return (
    <div className="mb-4 sm:mb-6">
      <label
        className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
        style={{
          color: theme.color_text_primary,
          fontFamily: theme.font_family,
        }}
      >
        Select Restaurant
      </label>
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {availableRestaurants.map((restaurant) => (
          <button
            key={restaurant.id}
            type="button"
            onClick={() => onRestaurantChange(restaurant.id)}
            className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 border-2 text-xs sm:text-sm font-medium transition-all"
            style={{
              borderRadius: theme.button_border_radius,
              borderColor:
                selectedRestaurantId === restaurant.id
                  ? theme.color_primary
                  : "#e5e7eb",
              backgroundColor:
                selectedRestaurantId === restaurant.id
                  ? `${theme.color_primary}15`
                  : "white",
              color:
                selectedRestaurantId === restaurant.id
                  ? theme.color_primary
                  : theme.color_text_primary,
              fontFamily: theme.font_family,
            }}
          >
            <UtensilsCrossed
              className="w-4 h-4 sm:w-5 sm:h-5"
              style={{
                color:
                  selectedRestaurantId === restaurant.id
                    ? theme.color_primary
                    : theme.color_text_secondary,
              }}
            />
            <span>{restaurant.name}</span>
            {selectedRestaurantId === restaurant.id && (
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 ml-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: theme.color_primary }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
