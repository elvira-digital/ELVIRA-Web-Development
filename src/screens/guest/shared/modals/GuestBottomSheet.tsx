/**
 * Guest Bottom Sheet Modal Component
 *
 * A reusable bottom sheet modal with black transparent background
 * Slides up from the bottom with smooth animations
 * Supports swipe-down to close gesture
 * Can be used across multiple guest pages
 */

import React, { useEffect, useState, useRef } from "react";
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
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Handle opening and closing animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setDragOffset(0);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

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

  // Handle touch/mouse drag to close
  const handleDragStart = (clientY: number) => {
    setDragStart(clientY);
  };

  const handleDragMove = (clientY: number) => {
    if (dragStart === null) return;

    const diff = clientY - dragStart;
    // Only allow dragging down (positive values)
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleDragEnd = () => {
    if (dragStart === null) return;

    // If dragged down more than 100px, close the sheet
    if (dragOffset > 100) {
      onClose();
    } else {
      // Snap back to original position
      setDragOffset(0);
    }

    setDragStart(null);
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-[9999] ${
          isClosing ? "animate-slide-down" : "animate-slide-up"
        }`}
        style={{
          maxHeight,
          transform:
            dragOffset > 0 && !isClosing
              ? `translateY(${dragOffset}px)`
              : undefined,
          transition:
            dragStart === null && !isClosing
              ? "transform 0.2s ease-out"
              : "none",
        }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
          {/* Handle Bar - Draggable Area */}
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleDragStart(e.clientY)}
            onMouseMove={(e) => {
              if (dragStart !== null) handleDragMove(e.clientY);
            }}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: title
                ? `calc(${maxHeight} - 120px)`
                : `calc(${maxHeight} - 60px)`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
