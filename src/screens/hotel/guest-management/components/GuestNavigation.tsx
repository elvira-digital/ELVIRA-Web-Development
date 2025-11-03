import { Button } from "../../../../components/ui";
import type { GuestInfo } from "../types";

interface GuestNavigationProps {
  currentGuestIndex: number;
  totalGuests: number;
  guests: GuestInfo[];
  onPreviousGuest: () => void;
  onNextGuest: () => void;
  onAddGuest: () => void;
  onRemoveGuest: () => void;
}

export function GuestNavigation({
  currentGuestIndex,
  totalGuests,
  guests,
  onPreviousGuest,
  onNextGuest,
  onAddGuest,
  onRemoveGuest,
}: GuestNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreviousGuest}
          disabled={currentGuestIndex === 0}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous guest"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Guest Indicators */}
        <div className="flex items-center gap-1">
          {guests.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentGuestIndex
                  ? "w-8 bg-emerald-500"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onNextGuest}
          disabled={currentGuestIndex === totalGuests - 1}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next guest"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Add Another Guest Button */}
      <div className="flex items-center gap-2">
        {totalGuests > 1 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRemoveGuest}
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
          >
            Remove Guest
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddGuest}
          leftIcon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          Add Another Guest
        </Button>
      </div>
    </div>
  );
}
