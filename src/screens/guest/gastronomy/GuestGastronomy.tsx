import React from "react";
import { useGuestAuth } from "../../../contexts/guest";
import { GuestGastronomyHeader } from "./GuestGastronomyHeader";
import { PlaceCategorySection } from "../shared/cards/place";
import { useGuestGastronomyPlaces } from "../../../hooks/guest-management/gastronomy";
import { PlaceDetailBottomSheet } from "../shared/modals";
import { GuestPlacesMapView } from "../shared/maps";
import { usePlaceMapView } from "../shared/hooks";

interface GuestGastronomyProps {
  onNavigate?: (path: string) => void;
}

export const GuestGastronomy: React.FC<GuestGastronomyProps> = ({
  onNavigate,
}) => {
  const { guestSession } = useGuestAuth();

  // Debug: Check localStorage session
  React.useEffect(() => {
    const storedSession = localStorage.getItem("guestSession");
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      console.log("🔍 LocalStorage Session hotelData:", parsed.hotelData);
    }
  }, []);

  // Fetch approved gastronomy places
  const { data: gastronomyPlaces = [], isLoading } = useGuestGastronomyPlaces(
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
    placesData: gastronomyPlaces,
    category: "gastronomy",
    hotelData: guestSession?.hotelData,
    apiKey: GOOGLE_API_KEY,
  });

  if (!guestSession) {
    return null;
  }

  const { hotelData } = guestSession;

  // If map view is open and hotel has coordinates, show full-page map
  if (isMapOpen && hotelLocation) {
    return (
      <>
        {/* Header with search and back to list button */}
        <GuestGastronomyHeader
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
            category="gastronomy"
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
      <GuestGastronomyHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onBackClick={() => onNavigate?.("/guest/home")}
        onMapClick={handleMapClick}
      />

      {/* Gastronomy Places */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading gastronomy places...</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery
              ? "No gastronomy places found matching your search."
              : "No gastronomy places available at the moment."}
          </p>
        </div>
      ) : (
        <>
          {/* Title Section */}
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-xl font-bold text-gray-900">
              Best Local Restaurants & Cafés
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Discover delicious dining experiences near your hotel
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
