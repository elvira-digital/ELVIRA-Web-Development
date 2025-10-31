/**
 * Guest Theme Context
 *
 * Provides hotel appearance settings throughout the guest application
 * Supports real-time updates when settings change in the database
 */

import React, { createContext } from "react";
import type { ReactNode } from "react";
import { useHotelAppearance } from "../../hooks/guest/useHotelAppearance";
import type { Database } from "../../types/database";

type HotelAppearanceSettings =
  Database["public"]["Tables"]["hotel_appearance_settings"]["Row"];

// Default theme values
const DEFAULT_THEME: Omit<
  HotelAppearanceSettings,
  "id" | "hotel_id" | "created_at" | "updated_at"
> = {
  // Colors
  color_primary: "#10b981", // emerald-500
  color_text_primary: "#111827", // gray-900
  color_text_secondary: "#6b7280", // gray-500
  color_text_inverse: "#ffffff", // white

  // Typography
  font_family: "Inter, system-ui, sans-serif",
  font_size_base: "16px",
  font_size_heading: "24px",
  font_size_small: "14px",
  font_weight_normal: "400",
  font_weight_medium: "500",
  font_weight_semibold: "600",
  font_weight_bold: "700",

  // Layout
  border_radius: "0.75rem", // 12px
  button_border_radius: "9999px", // Fully rounded for buttons
  card_style: "elevated",
  icon_size: "24px",

  // Stay Card
  stay_card_gradient_from: "#3b82f6", // blue-500
  stay_card_gradient_to: "#9333ea", // purple-600

  // About Us
  about_us_background_color: "#f3f4f6", // gray-100
};

interface GuestThemeContextValue {
  theme: typeof DEFAULT_THEME;
  isLoading: boolean;
}

const GuestThemeContext = createContext<GuestThemeContextValue | undefined>(
  undefined
);

interface GuestThemeProviderProps {
  children: ReactNode;
  hotelId: string | undefined;
}

// Helper function to convert user-friendly values to CSS values
const convertBorderRadiusToCSS = (value: string | null): string => {
  if (!value) return "0.75rem";

  const borderRadiusMap: Record<string, string> = {
    none: "0px",
    small: "0.375rem", // 6px
    medium: "0.5rem", // 8px
    large: "0.75rem", // 12px
    xlarge: "1rem", // 16px
    "2xlarge": "1.5rem", // 24px
    full: "9999px",
  };

  // If it's already a CSS value (contains px, rem, etc.), return as-is
  if (value.includes("px") || value.includes("rem") || value.includes("em")) {
    return value;
  }

  // Otherwise, map the friendly name to CSS
  return borderRadiusMap[value.toLowerCase()] || "0.75rem";
};

const convertIconSizeToCSS = (value: string | null): string => {
  if (!value) return "24px";

  const iconSizeMap: Record<string, string> = {
    small: "20px",
    medium: "24px",
    large: "28px",
    xlarge: "32px",
  };

  // If it's already a CSS value, return as-is
  if (value.includes("px") || value.includes("rem")) {
    return value;
  }

  return iconSizeMap[value.toLowerCase()] || "24px";
};

// Helper function to convert border radius specifically for buttons (fully rounded when "large")
const convertButtonBorderRadiusToCSS = (value: string | null): string => {
  if (!value) return "9999px"; // Default fully rounded for buttons

  const buttonBorderRadiusMap: Record<string, string> = {
    none: "0px",
    small: "0.375rem", // 6px
    medium: "0.5rem", // 8px
    large: "9999px", // Fully rounded (pill shape)
    xlarge: "9999px", // Fully rounded
    "2xlarge": "9999px", // Fully rounded
    full: "9999px",
  };

  // If it's already a CSS value, return as-is
  if (value.includes("px") || value.includes("rem") || value.includes("em")) {
    return value;
  }

  return buttonBorderRadiusMap[value.toLowerCase()] || "9999px";
};

export const GuestThemeProvider: React.FC<GuestThemeProviderProps> = ({
  children,
  hotelId,
}) => {
  const { data: appearanceSettings, isLoading } = useHotelAppearance(hotelId);

  // Merge database settings with defaults and convert values
  const theme = {
    ...DEFAULT_THEME,
    ...(appearanceSettings && {
      color_primary: appearanceSettings.color_primary,
      color_text_primary: appearanceSettings.color_text_primary,
      color_text_secondary: appearanceSettings.color_text_secondary,
      color_text_inverse: appearanceSettings.color_text_inverse,
      font_family: appearanceSettings.font_family,
      font_size_base: appearanceSettings.font_size_base,
      font_size_heading: appearanceSettings.font_size_heading,
      font_size_small: appearanceSettings.font_size_small,
      font_weight_normal: appearanceSettings.font_weight_normal,
      font_weight_medium: appearanceSettings.font_weight_medium,
      font_weight_semibold: appearanceSettings.font_weight_semibold,
      font_weight_bold: appearanceSettings.font_weight_bold,
      border_radius: convertBorderRadiusToCSS(appearanceSettings.border_radius),
      button_border_radius: convertButtonBorderRadiusToCSS(
        appearanceSettings.border_radius
      ), // Separate for buttons
      card_style: appearanceSettings.card_style,
      icon_size: convertIconSizeToCSS(appearanceSettings.icon_size),
      stay_card_gradient_from: appearanceSettings.stay_card_gradient_from,
      stay_card_gradient_to: appearanceSettings.stay_card_gradient_to,
      about_us_background_color: appearanceSettings.about_us_background_color,
    }),
  };

  // Debug: Log border radius conversion
  console.log("🎨 Theme border_radius conversion:", {
    original: appearanceSettings?.border_radius,
    converted: theme.border_radius,
  });

  return (
    <GuestThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </GuestThemeContext.Provider>
  );
};

// Export context and type for hooks file
export { GuestThemeContext };
export type { GuestThemeContextValue };
