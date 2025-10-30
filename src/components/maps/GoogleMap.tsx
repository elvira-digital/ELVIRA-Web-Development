/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import {
  useGoogleMaps,
  useMapInstance,
  useMapMarkers,
  useMapBounds,
  useUserLocation,
} from "../../hooks/maps";
import { LoadingSpinner } from "../ui/states/LoadingSpinner";

interface Location {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: Location;
  title?: string;
  icon?: string | any;
  onClick?: () => void;
}

interface GoogleMapProps {
  center: Location;
  zoom?: number;
  markers?: MapMarker[];
  fitBounds?: boolean;
  className?: string;
  onMapLoad?: (map: any) => void;
  showUserLocation?: boolean;
}

export function GoogleMap({
  center,
  zoom = 13,
  markers = [],
  fitBounds = false,
  className = "w-full h-full",
  onMapLoad,
  showUserLocation = true,
}: GoogleMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const { mapRef, map } = useMapInstance(isLoaded, { center, zoom });
  const { userLocation } = useUserLocation();

  // Add markers to map
  useMapMarkers(map, markers);

  // Fit bounds to include all markers
  const locations = fitBounds
    ? [center, ...markers.map((m) => m.position)]
    : [];
  useMapBounds(map, locations, 80);

  // Enable user location marker (blue dot)
  useEffect(() => {
    if (!map || !showUserLocation) return;

    // Enable geolocation control
    if (userLocation) {
      // Create custom user location marker with blue dot style
      const userMarker = new (window as any).google.maps.Marker({
        position: userLocation,
        map: map,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          fillColor: "#4285F4", // Google blue
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
          scale: 8,
        },
        title: "Your Location",
        zIndex: 1000,
      });

      // Add blue circle around the marker
      const accuracyCircle = new (window as any).google.maps.Circle({
        map: map,
        center: userLocation,
        radius: 50, // 50 meters accuracy circle
        fillColor: "#4285F4",
        fillOpacity: 0.15,
        strokeColor: "#4285F4",
        strokeOpacity: 0.3,
        strokeWeight: 1,
      });

      return () => {
        userMarker.setMap(null);
        accuracyCircle.setMap(null);
      };
    }
  }, [map, userLocation, showUserLocation]);

  // Callback when map is loaded - use useEffect to avoid calling setState during render
  useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load map</p>
          <p className="text-sm text-gray-600">
            {loadError.message || "Please check your connection and try again"}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
}
