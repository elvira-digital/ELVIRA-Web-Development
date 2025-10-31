/**
 * Guest Button Component
 *
 * Reusable button component for guest interface
 * Uses hotel appearance settings from theme context
 */

import React from "react";
import { useGuestTheme } from "../../../../contexts/guest";

interface GuestButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const GuestButton: React.FC<GuestButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  className = "",
  type = "button",
}) => {
  const { theme } = useGuestTheme();

  // Debug: Log border radius value
  console.log("🎨 GuestButton border_radius:", theme.border_radius);

  // Base styles
  const baseStyles =
    "font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  // Size styles with dynamic font sizes
  const sizeStyles = {
    sm: "py-1.5 px-3 sm:py-2 sm:px-4",
    md: "py-2 px-4 sm:py-2.5 sm:px-6",
    lg: "py-2.5 px-6 sm:py-3 sm:px-8",
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Get styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.color_primary,
          color: theme.color_text_inverse,
        };
      case "secondary":
        return {
          backgroundColor: theme.color_text_secondary,
          color: theme.color_text_inverse,
        };
      case "outline":
        return {
          backgroundColor: "white",
          color: theme.color_primary,
          border: `2px solid ${theme.color_primary}`,
        };
      default:
        return {
          backgroundColor: theme.color_primary,
          color: theme.color_text_inverse,
        };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${widthStyles} ${className}`}
      style={{
        ...getVariantStyles(),
        fontFamily: theme.font_family,
        fontSize: theme.font_size_base,
        fontWeight: theme.font_weight_semibold,
        borderRadius: theme.button_border_radius,
      }}
    >
      {children}
    </button>
  );
};
