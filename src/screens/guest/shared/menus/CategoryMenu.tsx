/**
 * Category Menu Component
 *
 * Horizontal menu with categories: Hotel, Experiences, To Visit
 * Matches the reference design with icon-based navigation
 * Uses hotel appearance settings from theme context
 */

import { Building2, MapPin, Compass } from "lucide-react";
import { useState } from "react";
import { useGuestTheme } from "../../../../contexts/guest";

export type CategoryType = "hotel" | "experiences" | "tovisit";

interface CategoryMenuProps {
  onCategoryChange?: (category: CategoryType) => void;
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

export const CategoryMenu = ({ onCategoryChange }: CategoryMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("hotel");
  const { theme } = useGuestTheme();

  const handleCategoryClick = (categoryId: CategoryType) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="mt-2 mb-2">
      {/* Grid container - 3 equal columns */}
      <div className="grid grid-cols-3 bg-white border-b border-gray-200">
        {categories.map((category) => {
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
