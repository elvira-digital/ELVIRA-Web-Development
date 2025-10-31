/**
 * Request History Item Components
 *
 * Individual cards for different types of requests/orders
 */

import React, { useState, useRef, useCallback } from "react";
import { Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import type { RequestHistoryItem } from "../types";

interface RequestHistoryCardProps {
  item: RequestHistoryItem;
  onClick?: () => void;
  onCancel?: (id: string, type: "amenity" | "restaurant" | "shop") => void;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * Base card component for all request types
 */
const RequestCard: React.FC<{
  id: string;
  type: "amenity" | "restaurant" | "shop";
  title: string;
  subtitle: string;
  status: string;
  total: number;
  deliveryInfo?: string;
  items: Array<{ name: string; quantity?: number; imageUrl?: string | null }>;
  notes?: string | null;
  onClick?: () => void;
  onCancel?: (id: string, type: "amenity" | "restaurant" | "shop") => void;
  isFirst?: boolean;
  isLast?: boolean;
}> = ({
  id,
  type,
  title,
  subtitle,
  status,
  total,
  deliveryInfo,
  items,
  notes,
  onCancel,
  isFirst = false,
  isLast = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const dragStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const isPending = status.toLowerCase() === "pending";
  const SWIPE_THRESHOLD = 100; // Swipe 100px to trigger cancel

  // Calculate border radius classes based on position
  const borderRadiusClass = `
    ${isFirst ? "rounded-t-lg" : ""}
    ${isLast ? "rounded-b-lg" : ""}
  `.trim();

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isPending) return;
      dragStartX.current = e.touches[0].clientX;
      setIsSwiping(true);
    },
    [isPending]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping || !isPending) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - dragStartX.current;
      // Only allow swiping right (positive values)
      if (diff > 0) {
        setDragOffset(diff);
      }
    },
    [isSwiping, isPending]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isPending) return;
    setIsSwiping(false);

    if (dragOffset >= SWIPE_THRESHOLD) {
      // Cancel the request
      if (onCancel) {
        onCancel(id, type);
      }
    } else {
      // Snap back
      setDragOffset(0);
    }
  }, [dragOffset, id, type, onCancel, isPending]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isPending) return;
      dragStartX.current = e.clientX;
      setIsSwiping(true);
    },
    [isPending]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSwiping || !isPending) return;
      const diff = e.clientX - dragStartX.current;
      if (diff > 0) {
        setDragOffset(diff);
      }
    },
    [isSwiping, isPending]
  );

  const handleMouseUp = useCallback(() => {
    if (!isPending) return;
    setIsSwiping(false);

    if (dragOffset >= SWIPE_THRESHOLD) {
      if (onCancel) {
        onCancel(id, type);
      }
    } else {
      setDragOffset(0);
    }
  }, [dragOffset, id, type, onCancel, isPending]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "approved":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Cancel background indicator - shows when swiping */}
      {isPending && dragOffset > 0 && (
        <div
          className={`absolute inset-0 bg-red-500 flex items-center justify-end px-6 ${borderRadiusClass}`}
          style={{
            opacity: Math.min(dragOffset / SWIPE_THRESHOLD, 1),
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <X className="w-6 h-6" />
            <span className="font-semibold">Cancel</span>
          </div>
        </div>
      )}

      {/* Main card - swipeable */}
      <div
        ref={cardRef}
        className="bg-white border-x border-b border-gray-200 first:border-t p-4 hover:shadow-sm transition-shadow relative"
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header Row - Always Visible */}
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                status
              )}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            )}
          </div>
        </div>

        {/* Swipe hint for pending requests */}
        {isPending && !isExpanded && dragOffset === 0 && (
          <div className="mt-2 text-[10px] sm:text-xs text-gray-400 italic">
            Swipe right to cancel →
          </div>
        )}

        {/* Expandable Content */}
        {isExpanded && (
          <div className="mt-3">
            {/* Delivery Info */}
            {deliveryInfo && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-3">
                <Clock className="w-4 h-4" />
                <span>{deliveryInfo}</span>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-1 mb-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs sm:text-sm"
                >
                  <span className="text-gray-700">
                    {item.quantity && item.quantity > 1 && (
                      <span className="font-medium">{item.quantity}x </span>
                    )}
                    {item.name}
                  </span>
                  {item.quantity && (
                    <span className="text-gray-500 text-xs">
                      $
                      {(
                        (total /
                          items.reduce(
                            (sum, i) => sum + (i.quantity || 1),
                            0
                          )) *
                        (item.quantity || 1)
                      ).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Total:
              </span>
              <span className="text-base sm:text-lg font-bold text-purple-600">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Notes:</span> {notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main component that renders the card
 */
export const RequestHistoryItemCard: React.FC<RequestHistoryCardProps> = ({
  item,
  onClick,
  onCancel,
  isFirst,
  isLast,
}) => {
  return (
    <RequestCard
      id={item.id}
      type={item.type}
      title={item.title}
      subtitle={item.subtitle}
      status={item.status}
      total={item.total}
      deliveryInfo={item.deliveryInfo}
      items={item.items}
      notes={item.notes}
      onClick={onClick}
      onCancel={onCancel}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
};
