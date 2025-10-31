/**
 * Guest Theme Hooks
 *
 * Hooks for accessing hotel appearance settings
 */

import { useContext } from "react";
import { GuestThemeContext } from "./GuestThemeContext";
import type { GuestThemeContextValue } from "./GuestThemeContext";

/**
 * Hook to access guest theme settings
 * @throws Error if used outside GuestThemeProvider
 */
export const useGuestTheme = (): GuestThemeContextValue => {
  const context = useContext(GuestThemeContext);
  if (!context) {
    throw new Error("useGuestTheme must be used within GuestThemeProvider");
  }
  return context;
};

/**
 * Helper hook to get CSS custom properties object
 * Can be spread into inline styles
 */
export const useGuestThemeStyles = () => {
  const { theme } = useGuestTheme();

  return {
    "--color-primary": theme.color_primary,
    "--color-text-primary": theme.color_text_primary,
    "--color-text-secondary": theme.color_text_secondary,
    "--color-text-inverse": theme.color_text_inverse,
    "--font-family": theme.font_family,
    "--font-size-base": theme.font_size_base,
    "--font-size-heading": theme.font_size_heading,
    "--font-size-small": theme.font_size_small,
    "--font-weight-normal": theme.font_weight_normal,
    "--font-weight-medium": theme.font_weight_medium,
    "--font-weight-semibold": theme.font_weight_semibold,
    "--font-weight-bold": theme.font_weight_bold,
    "--border-radius": theme.border_radius,
    "--icon-size": theme.icon_size,
    "--stay-card-gradient-from": theme.stay_card_gradient_from,
    "--stay-card-gradient-to": theme.stay_card_gradient_to,
    "--about-us-bg": theme.about_us_background_color,
  } as React.CSSProperties;
};
