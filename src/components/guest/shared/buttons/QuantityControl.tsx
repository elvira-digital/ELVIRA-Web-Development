/**
 * Quantity Control Component
 *
 * Reusable increment/decrement buttons for detail bottom sheets
 * Shows quantity counter with - and + buttons
 * Uses hotel appearance settings from theme context
 */

import React from "react";
import { Plus, Minus } from "lucide-react";
import { useGuestTheme } from "../../../../contexts/guest";

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  disableIncrement?: boolean;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
  disableIncrement = false,
}) => {
  const { theme } = useGuestTheme();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        onClick={onDecrement}
        className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center bg-white border-2 hover:bg-emerald-50 transition-colors shadow-lg"
        style={{
          borderColor: theme.color_primary,
          color: theme.color_primary,
          borderRadius: theme.button_border_radius,
        }}
        aria-label="Decrease quantity"
      >
        <Minus size={16} className="sm:w-5 sm:h-5" />
      </button>
      <div className="flex-1 text-center">
        <span
          className="text-lg sm:text-2xl font-bold"
          style={{
            fontFamily: theme.font_family,
            color: theme.color_text_primary,
          }}
        >
          {quantity}
        </span>
        <p
          className="text-xs sm:text-sm"
          style={{
            fontFamily: theme.font_family,
            color: theme.color_text_secondary,
          }}
        >
          in cart
        </p>
      </div>
      <button
        onClick={onIncrement}
        disabled={disabled || disableIncrement}
        className={`w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center transition-colors shadow-lg ${
          disabled || disableIncrement
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "hover:bg-emerald-700"
        }`}
        style={{
          backgroundColor:
            disabled || disableIncrement ? undefined : theme.color_primary,
          color:
            disabled || disableIncrement ? undefined : theme.color_text_inverse,
          borderRadius: theme.button_border_radius,
        }}
        aria-label="Increase quantity"
      >
        <Plus size={16} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};
