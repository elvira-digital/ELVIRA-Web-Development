import React from "react";
import { GuestPlacesMapView } from "../GuestPlacesMapView";
import { MapModalHeader } from "../components";
import type { GuestPlace } from "../types";

interface GuestPlacesMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: GuestPlace[];
  hotelLocation: { lat: number; lng: number };
  hotelName: string;
  category?: string;
  categoryLabel?: string;
  onPlaceClick?: (place: GuestPlace) => void;
}

export const GuestPlacesMapModal: React.FC<GuestPlacesMapModalProps> = ({
  isOpen,
  onClose,
  places,
  hotelLocation,
  hotelName,
  category,
  categoryLabel,
  onPlaceClick,
}) => {
  if (!isOpen) return null;

  const title = `${categoryLabel || "Places"} Map View`;
  const subtitle = `Showing ${places.length} ${
    categoryLabel?.toLowerCase() || "places"
  } near ${hotelName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 bg-white rounded-lg shadow-2xl overflow-hidden">
        <MapModalHeader title={title} subtitle={subtitle} onClose={onClose} />

        {/* Map Container */}
        <div className="w-full h-full pt-20">
          <GuestPlacesMapView
            places={places}
            hotelLocation={hotelLocation}
            hotelName={hotelName}
            category={category}
            onPlaceClick={onPlaceClick}
          />
        </div>
      </div>
    </div>
  );
};
