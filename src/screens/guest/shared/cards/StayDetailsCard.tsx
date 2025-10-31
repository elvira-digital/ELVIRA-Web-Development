/**
 * Stay Details Card Component
 *
 * Displays guest's stay information with check-in, check-out, room, and access code
 * Features a beautiful gradient background matching the reference design
 * Uses hotel appearance settings from theme context
 */

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useGuestTheme } from "../../../../contexts/guest";

interface StayDetailsCardProps {
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  accessCode: string;
}

export const StayDetailsCard = ({
  checkInDate,
  checkOutDate,
  roomNumber,
  accessCode,
}: StayDetailsCardProps) => {
  const [showAccessCode, setShowAccessCode] = useState(false);
  const { theme } = useGuestTheme();

  // Debug: Log border radius value
  console.log("🎨 StayDetailsCard border_radius:", theme.border_radius);

  // Format date to match the design (DD/MM/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Mask access code
  const maskedCode = "•".repeat(accessCode.length);

  return (
    <div className="mx-4 mt-2 mb-2">
      {/* Card with gradient background */}
      <div
        className="relative overflow-hidden p-4 shadow-lg"
        style={{
          background: `linear-gradient(to bottom right, ${theme.stay_card_gradient_from}, ${theme.stay_card_gradient_to})`,
          borderRadius: theme.border_radius,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10" />

        {/* Content */}
        <div className="relative z-10">
          {/* Title */}
          <h2
            className="mb-2.5 text-center font-semibold"
            style={{
              color: theme.color_text_inverse,
              fontSize: theme.font_size_heading,
              fontFamily: theme.font_family,
              fontWeight: theme.font_weight_semibold,
            }}
          >
            Your Stay Details
          </h2>

          {/* Grid of details */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Check-in */}
            <div
              className="bg-white/20 backdrop-blur-sm p-2.5"
              style={{ borderRadius: theme.border_radius }}
            >
              <p
                className="mb-0.5 text-white/80"
                style={{
                  fontSize: theme.font_size_small,
                  fontWeight: theme.font_weight_medium,
                  fontFamily: theme.font_family,
                }}
              >
                Check-in
              </p>
              <p
                className="text-white"
                style={{
                  fontSize: theme.font_size_base,
                  fontWeight: theme.font_weight_bold,
                  fontFamily: theme.font_family,
                }}
              >
                {formatDate(checkInDate)}
              </p>
            </div>

            {/* Check-out */}
            <div
              className="bg-white/20 backdrop-blur-sm p-2.5"
              style={{ borderRadius: theme.border_radius }}
            >
              <p
                className="mb-0.5 text-white/80"
                style={{
                  fontSize: theme.font_size_small,
                  fontWeight: theme.font_weight_medium,
                  fontFamily: theme.font_family,
                }}
              >
                Check-out
              </p>
              <p
                className="text-white"
                style={{
                  fontSize: theme.font_size_base,
                  fontWeight: theme.font_weight_bold,
                  fontFamily: theme.font_family,
                }}
              >
                {formatDate(checkOutDate)}
              </p>
            </div>

            {/* Room */}
            <div
              className="bg-white/20 backdrop-blur-sm p-2.5"
              style={{ borderRadius: theme.border_radius }}
            >
              <p
                className="mb-0.5 text-white/80"
                style={{
                  fontSize: theme.font_size_small,
                  fontWeight: theme.font_weight_medium,
                  fontFamily: theme.font_family,
                }}
              >
                Room
              </p>
              <p
                className="text-white"
                style={{
                  fontSize: theme.font_size_base,
                  fontWeight: theme.font_weight_bold,
                  fontFamily: theme.font_family,
                }}
              >
                {roomNumber}
              </p>
            </div>

            {/* Access Code */}
            <div
              className="bg-white/20 backdrop-blur-sm p-2.5"
              style={{ borderRadius: theme.border_radius }}
            >
              <p
                className="mb-0.5 text-white/80"
                style={{
                  fontSize: theme.font_size_small,
                  fontWeight: theme.font_weight_medium,
                  fontFamily: theme.font_family,
                }}
              >
                Access Code
              </p>
              <div className="flex items-center justify-between">
                <p
                  className="text-white"
                  style={{
                    fontSize: theme.font_size_base,
                    fontWeight: theme.font_weight_bold,
                    fontFamily: theme.font_family,
                  }}
                >
                  {showAccessCode ? accessCode : maskedCode}
                </p>
                <button
                  onClick={() => setShowAccessCode(!showAccessCode)}
                  className="ml-1.5 p-1 hover:bg-white/20 transition-colors touch-manipulation"
                  style={{ borderRadius: theme.border_radius }}
                  aria-label={
                    showAccessCode ? "Hide access code" : "Show access code"
                  }
                >
                  {showAccessCode ? (
                    <EyeOff
                      style={{
                        width: theme.icon_size,
                        height: theme.icon_size,
                      }}
                      className="text-white"
                    />
                  ) : (
                    <Eye
                      style={{
                        width: theme.icon_size,
                        height: theme.icon_size,
                      }}
                      className="text-white"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
