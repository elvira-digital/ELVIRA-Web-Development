/**
 * Photo Gallery Header Component
 *
 * Title and subtitle for the photo gallery section
 * Uses hotel appearance settings from theme context
 */

import React from "react";
import { useGuestTheme } from "../../../../../contexts/guest";

interface PhotoGalleryHeaderProps {
  subtitle?: string;
}

export const PhotoGalleryHeader: React.FC<PhotoGalleryHeaderProps> = ({
  subtitle = "Discover our beautiful spaces and amenities",
}) => {
  const { theme } = useGuestTheme();

  return (
    <div className="px-4 mb-3">
      {/* Title */}
      <h2
        className="mb-0.5"
        style={{
          fontSize: theme.font_size_heading,
          fontFamily: theme.font_family,
          fontWeight: theme.font_weight_bold,
          color: theme.color_text_primary,
        }}
      >
        Photo <span style={{ color: theme.color_primary }}>Gallery</span>
      </h2>
      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: theme.font_size_small,
            fontFamily: theme.font_family,
            color: theme.color_text_secondary,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
