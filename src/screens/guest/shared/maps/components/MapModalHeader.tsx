import React from "react";
import { X } from "lucide-react";

interface MapModalHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export const MapModalHeader: React.FC<MapModalHeaderProps> = ({
  title,
  subtitle,
  onClose,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close map"
      >
        <X className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
};
