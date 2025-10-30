import React from "react";
import {
  GoogleMap,
  type MapMarker,
} from "../../../../../components/maps/GoogleMap";

interface MapContainerProps {
  center: { lat: number; lng: number };
  markers: MapMarker[];
  zoom?: number;
  fitBounds?: boolean;
  showUserLocation?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center,
  markers,
  zoom = 13,
  fitBounds = true,
  showUserLocation = true,
}) => {
  return (
    <GoogleMap
      center={center}
      zoom={zoom}
      markers={markers}
      fitBounds={fitBounds}
      showUserLocation={showUserLocation}
      className="w-full h-full rounded-lg"
    />
  );
};
