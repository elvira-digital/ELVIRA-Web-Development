/**
 * Category Menu Component
 *
 * Horizontal menu with categories: Hotel, Q&A, Experiences, To Visit
 * Matches the reference design with icon-based navigation
 * Uses hotel appearance settings from theme context
 */

import { Building2, MapPin, Compass, HelpCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { useGuestTheme, useGuestAuth } from "../../../../contexts/guest";
import { useGuestHotelSettings } from "../../../../hooks/guest-management/settings/useGuestHotelSettings";

export type CategoryType = "hotel" | "experiences" | "tovisit" | "qna";

interface CategoryMenuProps {
  onCategoryChange?: (category: CategoryType) => void;
  onNavigate?: (path: string) => void;
}

interface CategoryItem {
  id: CategoryType;
  label: string;
  icon: React.ComponentType<{
    style?: React.CSSProperties;
    className?: string;
  }>;
}

const categories: CategoryItem[] = [
  {
    id: "hotel",
    label: "Hotel",
    icon: Building2,
  },
  {
    id: "qna",
    label: "Q&A",
    icon: HelpCircle,
  },
  {
    id: "experiences",
    label: "Experiences",
    icon: MapPin,
  },
  {
    id: "tovisit",
    label: "To Visit",
    icon: Compass,
  },
];

export const CategoryMenu = ({
  onCategoryChange,
  onNavigate,
}: CategoryMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("hotel");
  const { theme } = useGuestTheme();
  const { guestSession } = useGuestAuth();
  const { data: hotelSettings } = useGuestHotelSettings(
    guestSession?.guestData?.hotel_id
  );

  // Filter categories based on hotel settings
  const visibleCategories = useMemo(() => {
    return categories.filter((category) => {
      // Hide Q&A if disabled in settings
      if (category.id === "qna" && hotelSettings?.qaEnabled === false) {
        return false;
      }

      // Hide Hotel category if all hotel services are disabled
      if (category.id === "hotel") {
        const hasAnyHotelService =
          hotelSettings?.amenitiesEnabled !== false ||
          hotelSettings?.shopEnabled !== false ||
          hotelSettings?.restaurantEnabled !== false ||
          hotelSettings?.laundryEnabled !== false;
        return hasAnyHotelService;
      }

      // Hide Experiences category if all experiences are disabled
      if (category.id === "experiences") {
        const hasAnyExperience =
          hotelSettings?.localRestaurantsEnabled !== false ||
          hotelSettings?.toursEnabled !== false ||
          hotelSettings?.wellnessEnabled !== false;
        return hasAnyExperience;
      }

      // Hide To Visit category if places to visit is disabled
      if (category.id === "tovisit") {
        return hotelSettings?.placesToVisitEnabled !== false;
      }

      return true;
    });
  }, [hotelSettings]);

  const handleCategoryClick = (categoryId: CategoryType) => {
    // If Q&A is clicked, navigate directly to Q&A page
    if (categoryId === "qna") {
      onNavigate?.("/guest/qa");
      return;
    }

    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="mt-2 mb-2">
      {/* Grid container - dynamic columns based on visible categories */}
      <div
        className="grid bg-white border-b border-gray-200"
        style={{
          gridTemplateColumns: `repeat(${visibleCategories.length}, minmax(0, 1fr))`,
        }}
      >
        {visibleCategories.map((category) => {
          const isActive = activeCategory === category.id;
          const IconComponent = category.icon;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                relative flex flex-col items-center justify-center gap-1
                py-2.5 px-2
                transition-all duration-200 touch-manipulation
                ${isActive ? "" : "text-gray-600 hover:text-gray-900"}
              `}
              style={{
                color: isActive ? theme.color_primary : undefined,
              }}
            >
              {/* Icon */}
              <div>
                <IconComponent
                  style={{ width: theme.icon_size, height: theme.icon_size }}
                />
              </div>

              {/* Label */}
              <span
                className={`text-xs ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
                style={{
                  fontFamily: theme.font_family,
                }}
              >
                {category.label}
              </span>

              {/* Active indicator - underline that overlaps with bottom border */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 z-10"
                  style={{ backgroundColor: theme.color_primary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
