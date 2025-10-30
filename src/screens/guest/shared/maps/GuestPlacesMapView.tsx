import { useMemo } from "react";
import { MapContainer, MapLegendOverlay, MapPlaceCounter } from "./components";
import {
  createPlaceMarkers,
  createHotelMarker,
  combineMarkers,
  createMapLegendItems,
} from "./utils";
import type { GuestPlacesMapViewProps } from "./types";

export function GuestPlacesMapView({
  places,
  hotelLocation,
  hotelName,
  category,
  onPlaceClick,
}: GuestPlacesMapViewProps) {
  // Create markers for places
  const placeMarkers = useMemo(
    () => createPlaceMarkers(places, onPlaceClick),
    [places, onPlaceClick]
  );

  // Create hotel marker
  const hotelMarker = useMemo(
    () => createHotelMarker(hotelLocation, hotelName),
    [hotelLocation, hotelName]
  );

  // Combine all markers
  const allMarkers = useMemo(
    () => combineMarkers(hotelMarker, placeMarkers),
    [hotelMarker, placeMarkers]
  );

  // Legend items
  const legendItems = useMemo(
    () => createMapLegendItems(category, hotelName),
    [category, hotelName]
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={hotelLocation}
        markers={allMarkers}
        zoom={13}
        fitBounds={places.length > 0}
      />

      <MapLegendOverlay items={legendItems} title="Map Legend" />

      <MapPlaceCounter
        count={places.length}
        categoryLabel={category ? category : "places"}
      />
    </div>
  );
}
