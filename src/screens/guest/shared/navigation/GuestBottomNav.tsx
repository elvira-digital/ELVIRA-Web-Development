import React, { useMemo } from "react";
import {
  Home,
  ConciergeBell,
  UtensilsCrossed,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import {
  useGuestAuth,
  useGuestCart,
  useGuestTheme,
} from "../../../../contexts/guest";
import { useGuestHotelSettings } from "../../../../hooks/guest-management/settings/useGuestHotelSettings";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isAction?: boolean;
  enabled?: boolean;
  badgeCount?: number;
}

interface GuestBottomNavProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const GuestBottomNav: React.FC<GuestBottomNavProps> = ({
  currentPath = "/guest/home",
  onNavigate,
}) => {
  const { signOut, guestSession } = useGuestAuth();
  const { amenityCartCount, restaurantCartCount, shopCartCount } =
    useGuestCart();
  const { theme } = useGuestTheme();
  const { data: hotelSettings } = useGuestHotelSettings(
    guestSession?.guestData?.hotel_id
  );

  const navItems: NavItem[] = useMemo(
    () => [
      {
        id: "home",
        label: "Home",
        icon: (
          <Home style={{ width: theme.icon_size, height: theme.icon_size }} />
        ),
        path: "/guest/home",
        enabled: true, // Home is always enabled
      },
      {
        id: "services",
        label: "Services",
        icon: (
          <ConciergeBell
            style={{ width: theme.icon_size, height: theme.icon_size }}
          />
        ),
        path: "/guest/services",
        enabled: hotelSettings?.amenitiesEnabled ?? true,
        badgeCount: amenityCartCount,
      },
      {
        id: "dine-in",
        label: "Dine In",
        icon: (
          <UtensilsCrossed
            style={{ width: theme.icon_size, height: theme.icon_size }}
          />
        ),
        path: "/guest/restaurant",
        enabled: hotelSettings?.restaurantEnabled ?? true,
        badgeCount: restaurantCartCount,
      },
      {
        id: "shop",
        label: "Shop",
        icon: (
          <ShoppingBag
            style={{ width: theme.icon_size, height: theme.icon_size }}
          />
        ),
        path: "/guest/shop",
        enabled: hotelSettings?.shopEnabled ?? true,
        badgeCount: shopCartCount,
      },
      {
        id: "logout",
        label: "Logout",
        icon: (
          <LogOut style={{ width: theme.icon_size, height: theme.icon_size }} />
        ),
        path: "/logout",
        isAction: true,
        enabled: true, // Logout is always enabled
      },
    ],
    [
      hotelSettings,
      amenityCartCount,
      restaurantCartCount,
      shopCartCount,
      theme.icon_size,
    ]
  );

  // Filter navigation items based on settings
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => item.enabled),
    [navItems]
  );

  const handleNavClick = (item: NavItem) => {
    if (item.isAction && item.id === "logout") {
      signOut();
    } else if (onNavigate) {
      onNavigate(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md shadow-lg z-40">
      <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
        {visibleNavItems.map((item) => {
          const isActive = currentPath === item.path && !item.isAction;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 transition-all flex-1 relative ${
                isActive
                  ? ""
                  : item.isAction
                  ? "hover:text-red-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{
                color: isActive
                  ? theme.color_primary
                  : item.isAction
                  ? "#ef4444"
                  : undefined,
              }}
            >
              <div className="relative scale-90">
                {item.icon}
                {/* Badge - Red dot indicator */}
                {typeof item.badgeCount === "number" && item.badgeCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full w-2.5 h-2.5 border-2 border-white shadow-sm"></span>
                )}
              </div>
              <span
                className={`text-xs ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
                style={{
                  fontFamily: theme.font_family,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
