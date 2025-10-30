import React from "react";
import { Search, X } from "lucide-react";

interface MapSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  resultsCount?: number;
}

export const MapSearchBox: React.FC<MapSearchBoxProps> = ({
  value,
  onChange,
  onClear,
  placeholder = "Search places...",
  resultsCount,
}) => {
  return (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex justify-center">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center px-3 py-2 sm:px-4 sm:py-2.5 gap-1.5 sm:gap-2 hover:bg-white transition-colors">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-xs sm:text-sm"
        />

        {value && (
          <>
            {resultsCount !== undefined && (
              <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                {resultsCount} {resultsCount === 1 ? "result" : "results"}
              </span>
            )}

            <button
              onClick={onClear}
              className="flex-shrink-0 p-0.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
