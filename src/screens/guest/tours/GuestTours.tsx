import React from "react";
import { useGuestAuth } from "../../../contexts/guest";
import { GuestToursHeader } from "./GuestToursHeader";
import { PlaceCategorySection } from "../shared/cards/place";
import { useGuestToursPlaces } from "../../../hooks/guest-management/tours";
import { PlaceDetailBottomSheet } from "../shared/modals";
import { GuestPlacesMapView } from "../shared/maps";
import { usePlaceMapView } from "../shared/hooks";

interface GuestToursProps {
  onNavigate?: (path: string) => void;
}

export const GuestTours: React.FC<GuestToursProps> = ({ onNavigate }) => {
  const { guestSession } = useGuestAuth();

  // Fetch approved tours places
  const { data: toursPlaces = [], isLoading } = useGuestToursPlaces(
    guestSession?.guestData?.hotel_id
  );

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || "";

  // Use shared map view hook
  const {
    searchQuery,
    selectedPlace,
    isDetailOpen,
    isMapOpen,
    hotelLocation,
    filteredPlaces,
    filteredMapPlaces,
    setSearchQuery,
    handlePlaceClick,
    handleCloseDetail,
    handleMapClick,
    handleCloseMap,
    handleMapPlaceClick,
  } = usePlaceMapView({
    placesData: toursPlaces,
    category: "tours",
    hotelData: guestSession?.hotelData,
    apiKey: GOOGLE_API_KEY,
  });

  if (!guestSession) {
    return null;
  }

  const { hotelData } = guestSession;

  // Show message if map is requested but no coordinates available
  if (isMapOpen && !hotelLocation) {
    return (
      <>
        <GuestToursHeader
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onBackClick={() => onNavigate?.("/guest/home")}
          onMapClick={handleMapClick}
        />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-1">
                  Map View Unavailable
                </h3>
                <p className="text-sm text-yellow-700">
                  Hotel location coordinates are not available in your current
                  session. Please log out and log back in to refresh your
                  session data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If map view is open and hotel has coordinates, show full-page map
  if (isMapOpen && hotelLocation) {
    return (
      <>
        {/* Header with search and back to list button */}
        <GuestToursHeader
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onBackClick={handleCloseMap}
          onMapClick={undefined}
        />

        {/* Full-page map */}
        <div className="h-[calc(100vh-120px)] w-full">
          <GuestPlacesMapView
            places={filteredMapPlaces}
            hotelLocation={hotelLocation}
            hotelName={hotelData.name || "Your Hotel"}
            category="tours"
            onPlaceClick={handleMapPlaceClick}
          />
        </div>

        {/* Place Detail Bottom Sheet */}
        <PlaceDetailBottomSheet
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          place={selectedPlace}
        />
      </>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <GuestToursHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onBackClick={() => onNavigate?.("/guest/home")}
        onMapClick={handleMapClick}
      />

      {/* Tours Places */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tours and activities...</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery
              ? "No tours found matching your search."
              : "No tours and activities available at the moment."}
          </p>
        </div>
      ) : (
        <>
          {/* Title Section */}
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-xl font-bold text-gray-900">
              Best Local Tours & Activities
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Explore the area with these exciting tours and experiences
            </p>
          </div>

          <PlaceCategorySection
            items={filteredPlaces}
            onItemClick={handlePlaceClick}
            showCategoryHeader={false}
          />
        </>
      )}

      {/* Place Detail Bottom Sheet */}
      <PlaceDetailBottomSheet
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        place={selectedPlace}
      />
    </>
  );
};
