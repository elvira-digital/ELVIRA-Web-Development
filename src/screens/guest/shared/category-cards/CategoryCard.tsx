/**
 * Shared Category Card Component
 *
 * Reusable card component for displaying category items
 * Features a title and description in a clean card layout
 * Uses hotel appearance settings from theme context
 */

import React from "react";
import { useGuestTheme } from "../../../../contexts/guest";

interface CategoryCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  onClick,
}) => {
  const { theme } = useGuestTheme();

  return (
    <button
      onClick={onClick}
      className="w-full text-left border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 touch-manipulation overflow-hidden"
      style={{
        borderRadius: theme.border_radius,
      }}
    >
      {/* Title with background */}
      <div
        className="px-3 py-2"
        style={{
          backgroundColor: `${theme.color_primary}15`, // 15 = ~8% opacity in hex
        }}
      >
        <h3
          style={{
            fontSize: theme.font_size_small,
            fontFamily: theme.font_family,
            fontWeight: theme.font_weight_semibold,
            color: theme.color_text_primary,
          }}
        >
          {title}
        </h3>
      </div>

      {/* Description without background */}
      <div className="bg-white px-3 py-2">
        <p
          className="leading-snug"
          style={{
            fontSize: theme.font_size_small,
            fontFamily: theme.font_family,
            fontWeight: theme.font_weight_normal,
            color: theme.color_text_secondary,
          }}
        >
          {description}
        </p>
      </div>
    </button>
  );
};
