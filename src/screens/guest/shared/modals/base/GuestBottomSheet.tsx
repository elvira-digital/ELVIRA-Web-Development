/**
 * Guest Bottom Sheet Modal Component
 *
 * A reusable bottom sheet modal with black transparent background
 * Slides up from the bottom with smooth animations
 * Can be used across multiple guest pages
 */

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface GuestBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const GuestBottomSheet: React.FC<GuestBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = "90vh",
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-[9999] animate-slide-up"
        style={{ maxHeight }}
      >
        <div className="bg-white rounded-t-[1.5rem] shadow-2xl overflow-hidden">
          {/* Handle Bar */}
          <div className="flex justify-center pt-2 pb-1.5">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: title
                ? `calc(${maxHeight} - 100px)`
                : `calc(${maxHeight} - 50px)`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
