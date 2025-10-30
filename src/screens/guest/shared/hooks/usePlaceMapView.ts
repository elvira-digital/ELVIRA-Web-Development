import { useState, useMemo } from "react";
import type { GuestPlace } from "../maps/types";
import type { PlaceDetailData } from "../modals";
import {
  transformToMapPlaces,
  transformToCardPlaces,
  transformToGoogleData,
} from "../utils";

interface UsePlaceMapViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placesData: any[];
  category: "gastronomy" | "wellness" | "tours";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hotelData: any;
  apiKey: string;
}

/**
 * Reusable hook for managing place map view state and logic
 * Used by gastronomy, wellness, and tours pages
 */
export const usePlaceMapView = ({
  placesData,
  category,
  hotelData,
  apiKey,
}: UsePlaceMapViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetailData | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Get hotel location (no defaults for multitenant system)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotelLocation = useMemo(() => {
    if (!hotelData) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lat = (hotelData as any).latitude || (hotelData as any).lat;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lng =
      (hotelData as any).longitude ||
      (hotelData as any).lng ||
      (hotelData as any).lon;
    return lat && lng ? { lat, lng } : null;
  }, [hotelData]);

  // Transform places for list view
  const places = useMemo(
    () => transformToCardPlaces(placesData, apiKey),
    [placesData, apiKey]
  );

  // Transform places for map view
  const mapPlaces: GuestPlace[] = useMemo(
    () => transformToMapPlaces(placesData, category),
    [placesData, category]
  );

  // Filter list places by search query
  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) {
      return places;
    }

    const query = searchQuery.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return places.filter(
      (place: any) =>
        place.title.toLowerCase().includes(query) ||
        place.description.toLowerCase().includes(query)
    );
  }, [places, searchQuery]);

  // Filter map places by search query
  const filteredMapPlaces = useMemo(() => {
    if (!searchQuery.trim()) {
      return mapPlaces;
    }

    const query = searchQuery.toLowerCase();
    return mapPlaces.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        (place.vicinity && place.vicinity.toLowerCase().includes(query))
    );
  }, [mapPlaces, searchQuery]);

  // Handle place click from list or map
  const handlePlaceClick = (placeId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const placeData = placesData.find((item: any) => {
      const place = item.thirdparty_places;
      return place?.id === placeId;
    });

    if (placeData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const place = (placeData as any).thirdparty_places;
      const googleData = transformToGoogleData(place);

      setSelectedPlace({
        id: place.id,
        name: place.name || "Unknown",
        google_data: googleData,
        recommended: placeData.hotel_recommended || false,
        type: place.category || category,
        hotelCoordinates:
          hotelData.latitude && hotelData.longitude
            ? {
                lat: hotelData.latitude,
                lng: hotelData.longitude,
              }
            : undefined,
      });
      setIsDetailOpen(true);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPlace(null);
  };

  const handleMapClick = () => {
    setIsMapOpen(true);
  };

  const handleCloseMap = () => {
    setIsMapOpen(false);
  };

  const handleMapPlaceClick = (place: GuestPlace) => {
    handlePlaceClick(place.id);
  };

  return {
    // State
    searchQuery,
    selectedPlace,
    isDetailOpen,
    isMapOpen,
    hotelLocation,

    // Transformed data
    places,
    mapPlaces,
    filteredPlaces,
    filteredMapPlaces,

    // Handlers
    setSearchQuery,
    handlePlaceClick,
    handleCloseDetail,
    handleMapClick,
    handleCloseMap,
    handleMapPlaceClick,
  };
};
