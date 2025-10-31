/**
 * About Us Section Component
 *
 * Displays hotel information with a booking button
 * Uses hotel appearance settings from theme context
 */

import React from "react";
import { useGuestTheme } from "../../../../contexts/guest";

interface AboutUsSectionProps {
  aboutText: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  aboutText,
  buttonText = "Booking",
  onButtonClick,
}) => {
  const { theme } = useGuestTheme();

  return (
    <section
      className="text-white py-12"
      style={{
        backgroundColor: theme.about_us_background_color,
      }}
    >
      <div className="max-w-md mx-auto px-6">
        {/* Title */}
        <h2
          className="mb-6 text-center"
          style={{
            fontSize: theme.font_size_heading,
            fontFamily: theme.font_family,
            fontWeight: theme.font_weight_bold,
            color: theme.color_text_inverse,
          }}
        >
          About <span style={{ color: theme.color_primary }}>Us</span>
        </h2>

        {/* About Text - White Box */}
        <div
          className="bg-white p-6 mb-6"
          style={{ borderRadius: theme.border_radius }}
        >
          <p
            className="text-center leading-relaxed"
            style={{
              fontSize: theme.font_size_base,
              fontFamily: theme.font_family,
              fontWeight: theme.font_weight_normal,
              color: theme.color_text_primary,
            }}
          >
            {aboutText}
          </p>
        </div>

        {/* Booking Button */}
        <div className="flex justify-center">
          <button
            onClick={onButtonClick}
            className="px-6 py-3 transition-opacity active:opacity-80"
            style={{
              backgroundColor: theme.color_primary,
              color: theme.color_text_inverse,
              fontFamily: theme.font_family,
              fontSize: theme.font_size_base,
              fontWeight: theme.font_weight_semibold,
              borderRadius: theme.border_radius,
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
};
