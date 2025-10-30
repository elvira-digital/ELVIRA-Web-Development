/**
 * Photo Gallery Header Component
 *
 * Title and subtitle for the photo gallery section
 */

import React from "react";

interface PhotoGalleryHeaderProps {
  subtitle?: string;
}

export const PhotoGalleryHeader: React.FC<PhotoGalleryHeaderProps> = ({
  subtitle = "Discover our beautiful spaces and amenities",
}) => {
  return (
    <div className="px-4 mb-3">
      {/* Title */}
      <h2 className="text-lg font-bold text-gray-900 mb-0.5">
        Photo <span className="text-blue-600">Gallery</span>
      </h2>
      {/* Subtitle */}
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
};
