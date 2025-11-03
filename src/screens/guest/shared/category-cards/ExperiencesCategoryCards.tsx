/**
 * Experiences Category Cards Component
 *
 * Displays 3 cards for experience-related services:
 * - Gastronomy
 * - Tours
 * - Wellness
 */

import React, { useMemo } from "react";
import { CategoryCard } from "./CategoryCard";
import { useGuestAuth } from "../../../../contexts/guest";
import { useGuestHotelSettings } from "../../../../hooks/guest-management/settings/useGuestHotelSettings";

interface ExperiencesCategoryCardsProps {
  onNavigate?: (path: string) => void;
}

export const ExperiencesCategoryCards: React.FC<
  ExperiencesCategoryCardsProps
> = ({ onNavigate }) => {
  const { guestSession } = useGuestAuth();
  const { data: hotelSettings } = useGuestHotelSettings(
    guestSession?.guestData?.hotel_id
  );

  const experienceCards = useMemo(
    () => [
      {
        id: "gastronomy",
        title: "Gastronomy",
        description: "Culinary experiences and dining",
        path: "/guest/gastronomy",
        enabled: hotelSettings?.localRestaurantsEnabled ?? true,
      },
      {
        id: "tours",
        title: "Tours",
        description: "Local attractions and excursions",
        path: "/guest/tours",
        enabled: hotelSettings?.toursEnabled ?? true,
      },
      {
        id: "wellness",
        title: "Wellness",
        description: "Spa and relaxation services",
        path: "/guest/wellness",
        enabled: hotelSettings?.wellnessEnabled ?? true,
      },
    ],
    [hotelSettings]
  );

  // Filter cards based on settings
  const visibleCards = useMemo(
    () => experienceCards.filter((card) => card.enabled),
    [experienceCards]
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
