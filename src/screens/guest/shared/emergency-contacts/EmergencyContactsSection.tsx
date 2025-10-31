/**
 * Emergency Contacts Section Component
 *
 * Displays important contact information for guest safety
 * Uses hotel appearance settings from theme context
 */

import React from "react";
import { Phone } from "lucide-react";
import { useGuestTheme } from "../../../../contexts/guest";

interface EmergencyContact {
  id: string;
  contact_name: string;
  phone_number: string;
}

interface EmergencyContactsSectionProps {
  contacts: EmergencyContact[];
  subtitle?: string;
}

export const EmergencyContactsSection: React.FC<
  EmergencyContactsSectionProps
> = ({
  contacts,
  subtitle = "Important contact information for your safety",
}) => {
  const { theme } = useGuestTheme();

  if (!contacts || contacts.length === 0) {
    return null;
  }

  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <section className="py-4 px-4 bg-white">
      <div className="mb-3">
        {/* Title */}
        <h2
          className="mb-0.5"
          style={{
            fontSize: theme.font_size_heading,
            fontFamily: theme.font_family,
            fontWeight: theme.font_weight_bold,
            color: theme.color_text_primary,
          }}
        >
          Emergency <span style={{ color: theme.color_primary }}>Contacts</span>
        </h2>
        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: theme.font_size_small,
              fontFamily: theme.font_family,
              color: theme.color_text_secondary,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Contacts List Container with Border */}
      <div
        className="border border-gray-200 overflow-hidden"
        style={{ borderRadius: theme.border_radius }}
      >
        <div className="divide-y divide-gray-200">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between py-3 px-3 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Contact Name */}
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                {contact.contact_name}
              </h3>

              {/* Phone Number with Call Button */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCall(contact.phone_number)}
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  {contact.phone_number}
                </button>
                <button
                  onClick={() => handleCall(contact.phone_number)}
                  className="transition-colors duration-200"
                  style={{ color: theme.color_primary }}
                  aria-label={`Call ${contact.contact_name}`}
                >
                  <Phone
                    style={{ width: theme.icon_size, height: theme.icon_size }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
