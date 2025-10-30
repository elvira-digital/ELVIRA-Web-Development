import React from "react";
import { X } from "lucide-react";
import { GuestPlacesMapView, type GuestPlace } from "../maps";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {categoryLabel || "Places"} Map View
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {places.length} {categoryLabel?.toLowerCase() || "places"}{" "}
              near {hotelName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close map"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

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
