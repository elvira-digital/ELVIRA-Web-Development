/**
 * To Visit Category Cards Component
 *
 * Displays a single card for "To Visit" places:
 * - Places to Visit
 */

import React, { useMemo } from "react";
import { CategoryCard } from "./CategoryCard";
import { useGuestAuth } from "../../../../contexts/guest";
import { useGuestHotelSettings } from "../../../../hooks/guest-management/settings/useGuestHotelSettings";

interface ToVisitCategoryCardsProps {
  onNavigate?: (path: string) => void;
}

export const ToVisitCategoryCards: React.FC<ToVisitCategoryCardsProps> = ({
  onNavigate,
}) => {
  const { guestSession } = useGuestAuth();
  const { data: hotelSettings } = useGuestHotelSettings(
    guestSession?.guestData?.hotel_id
  );

  const toVisitCards = useMemo(
    () => [
      {
        id: "places-to-visit",
        title: "Places to Visit",
        description: "Discover must-see locations",
        path: "/guest/to-visit",
        enabled: hotelSettings?.placesToVisitEnabled ?? true,
      },
    ],
    [hotelSettings]
  );

  // Filter cards based on settings
  const visibleCards = useMemo(
    () => toVisitCards.filter((card) => card.enabled),
    [toVisitCards]
  );

  // If no cards are visible, return null
  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 px-4">
      {visibleCards.map((card) => (
        <CategoryCard
          key={card.id}
          title={card.title}
          description={card.description}
          onClick={() => onNavigate?.(card.path)}
        />
      ))}
    </div>
  );
};
