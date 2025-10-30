import React from "react";
import { MapPin } from "lucide-react";

interface MapPlaceCounterProps {
  count: number;
  categoryLabel?: string;
}

export const MapPlaceCounter: React.FC<MapPlaceCounterProps> = ({
  count,
  categoryLabel = "places",
}) => {
  return (
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full shadow-md px-3 py-1.5 z-10 hover:bg-white transition-all duration-200">
      <div className="flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-emerald-600" />
        <p className="text-xs text-gray-700">
          <span className="font-semibold">{count}</span> {categoryLabel}
        </p>
      </div>
    </div>
  );
};
