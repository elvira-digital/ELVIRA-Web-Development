import { Input, Select } from "../../../../components/ui";
import type { GuestInfo } from "../types";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "../constants";

interface GuestFormFieldsProps {
  guest: GuestInfo;
  guestIndex: number;
  totalGuests: number;
  onGuestChange: (index: number, field: keyof GuestInfo, value: string) => void;
  isViewMode?: boolean;
  onGenerateCode?: (index: number) => void;
}

export function GuestFormFields({
  guest,
  guestIndex,
  totalGuests,
  onGuestChange,
  isViewMode = false,
  onGenerateCode,
}: GuestFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Guest Number Indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span>
          Guest {guestIndex + 1} of {totalGuests}
        </span>
      </div>

      {/* Access Code - Each guest has their own */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <Input
          label="Access Code"
          placeholder="6-digit code"
          value={guest.accessCode}
          onChange={(e) =>
            onGuestChange(guestIndex, "accessCode", e.target.value)
          }
          maxLength={6}
          disabled={isViewMode}
          rightIcon={
            !isViewMode && onGenerateCode ? (
              <button
                type="button"
                onClick={() => onGenerateCode(guestIndex)}
                className="text-emerald-600 hover:text-emerald-700"
                title="Generate code"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            ) : undefined
          }
        />
        <div className="mt-6 text-sm text-gray-600">
          <p className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              This unique code allows the guest to access their personal mobile
              app and services during their stay.
            </span>
          </p>
        </div>
      </div>

      {/* First Name, Last Name & Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="First Name"
          placeholder="Enter first name"
          value={guest.firstName}
          onChange={(e) =>
            onGuestChange(guestIndex, "firstName", e.target.value)
          }
          required
          disabled={isViewMode}
        />
        <Input
          label="Last Name"
          placeholder="Enter last name"
          value={guest.lastName}
          onChange={(e) =>
            onGuestChange(guestIndex, "lastName", e.target.value)
          }
          required
          disabled={isViewMode}
        />
        <Input
          label="Date of Birth"
          type="date"
          placeholder="dd/mm/aaaa"
          value={guest.dateOfBirth}
          onChange={(e) =>
            onGuestChange(guestIndex, "dateOfBirth", e.target.value)
          }
          disabled={isViewMode}
        />
      </div>

      {/* Email & Phone Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter email address"
          value={guest.email}
          onChange={(e) => onGuestChange(guestIndex, "email", e.target.value)}
          disabled={isViewMode}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="Enter phone number"
          value={guest.phoneNumber}
          onChange={(e) =>
            onGuestChange(guestIndex, "phoneNumber", e.target.value)
          }
          disabled={isViewMode}
        />
      </div>

      {/* Country & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Country"
          options={COUNTRY_OPTIONS}
          value={guest.country}
          onChange={(e) => onGuestChange(guestIndex, "country", e.target.value)}
          disabled={isViewMode}
        />
        <Select
          label="Language"
          options={LANGUAGE_OPTIONS}
          value={guest.language}
          onChange={(e) =>
            onGuestChange(guestIndex, "language", e.target.value)
          }
          disabled={isViewMode}
        />
      </div>
    </div>
  );
}
