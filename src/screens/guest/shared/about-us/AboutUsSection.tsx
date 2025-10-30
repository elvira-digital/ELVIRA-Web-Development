/**
 * About Us Section Component
 *
 * Displays hotel information with a booking button
 */

import React from "react";
import { GuestButton } from "../../../../components/guest/shared/buttons/GuestButton";

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
  return (
    <section className="bg-gray-900 text-white py-12">
      <div className="max-w-md mx-auto px-6">
        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold mb-6 text-center">
          About <span className="text-blue-500">Us</span>
        </h2>

        {/* About Text - White Box */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed text-center">
            {aboutText}
          </p>
        </div>

        {/* Booking Button */}
        <div className="flex justify-center">
          <GuestButton
            onClick={onButtonClick}
            size="md"
            variant="primary"
            className="!bg-blue-500 hover:!bg-blue-600 active:!bg-blue-700"
          >
            {buttonText}
          </GuestButton>
        </div>
      </div>
    </section>
  );
};
