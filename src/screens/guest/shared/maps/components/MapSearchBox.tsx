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
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-center">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center px-4 py-2.5 gap-2 hover:bg-white transition-colors">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm"
        />

        {value && (
          <>
            {resultsCount !== undefined && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                {resultsCount} {resultsCount === 1 ? "result" : "results"}
              </span>
            )}

            <button
              onClick={onClear}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
