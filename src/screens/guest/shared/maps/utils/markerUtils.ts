import { type MapMarker } from "../../../../../components/maps/GoogleMap";
import {
  createHotelMarkerIcon,
  createPlaceMarkerIcon,
} from "../../../../../components/maps/markers/MarkerIcons";
import type { GuestPlace } from "../types";

/**
 * Creates map markers for guest places
 */
export function createPlaceMarkers(
  places: GuestPlace[],
  onPlaceClick?: (place: GuestPlace) => void
): MapMarker[] {
  return places.map((place) => ({
    id: place.id,
    position: {
      lat: place.latitude,
      lng: place.longitude,
    },
    title: place.name,
    icon: createPlaceMarkerIcon(
      place.category,
      place.hotel_approved !== false,
      place.hotel_recommended || false
    ),
    onClick: () => {
      if (onPlaceClick) {
        onPlaceClick(place);
      }
    },
  }));
}

/**
 * Creates a hotel marker
 */
export function createHotelMarker(
  hotelLocation: { lat: number; lng: number },
  hotelName: string
): MapMarker {
  return {
    id: "hotel",
    position: hotelLocation,
    title: hotelName,
    icon: createHotelMarkerIcon(),
  };
}

/**
 * Combines hotel and place markers
 */
export function combineMarkers(
  hotelMarker: MapMarker,
  placeMarkers: MapMarker[]
): MapMarker[] {
  return [hotelMarker, ...placeMarkers];
}
