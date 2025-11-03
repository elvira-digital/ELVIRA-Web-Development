import React, { useState } from "react";
import { GuestHome } from "./home";
import { GuestShop } from "./shop";
import { GuestAmenities } from "./amenities";
import { GuestRestaurant } from "./restaurant";
import { GuestQA } from "./qa";
import { GuestLaundry } from "./laundry";
import { GuestPlaces } from "./places";
import { GuestTours } from "./tours";
import { GuestWellness } from "./wellness";
import { GuestGastronomy } from "./gastronomy";
import { GuestToVisit } from "./to-visit";
import { RequestHistoryBottomSheet } from "./request-history";
import { GuestPageLayout } from "./shared/layout";
import { useGuestAuth } from "../../contexts/guest";
import { GuestNotificationProvider } from "../../contexts/guest/GuestNotificationContext";
import { GuestCartProvider } from "../../contexts/guest/GuestCartContext";
import { GuestThemeProvider } from "../../contexts/guest/GuestThemeContext";
import { useGuestHotelSettings } from "../../hooks/guest-management/settings/useGuestHotelSettings";

type GuestRoute =
  | "/guest/home"
  | "/guest/shop"
  | "/guest/amenities"
  | "/guest/restaurant"
  | "/guest/qa"
  | "/guest/laundry"
  | "/guest/places"
  | "/guest/tours"
  | "/guest/wellness"
  | "/guest/gastronomy"
  | "/guest/services"
  | "/guest/to-visit";

export const GuestRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<GuestRoute>("/guest/home");
  const [isRequestHistoryOpen, setIsRequestHistoryOpen] = useState(false);
  const { guestSession } = useGuestAuth();
  const { data: hotelSettings } = useGuestHotelSettings(
    guestSession?.guestData?.hotel_id
  );

  // Check if at least one hotel service card is enabled (for showing request history)
  const hasAnyHotelService =
    hotelSettings?.amenitiesEnabled !== false ||
    hotelSettings?.shopEnabled !== false ||
    hotelSettings?.restaurantEnabled !== false ||
    hotelSettings?.laundryEnabled !== false;

  const handleNavigate = (path: string) => {
    setCurrentRoute(path as GuestRoute);
  };

  const handleClockClick = () => {
    setIsRequestHistoryOpen(true);
  };

  const handleCloseRequestHistory = () => {
    setIsRequestHistoryOpen(false);
  };

  const renderPage = () => {
    switch (currentRoute) {
      case "/guest/home":
        return <GuestHome onNavigate={handleNavigate} />;
      case "/guest/shop":
        return <GuestShop onNavigate={handleNavigate} />;
      case "/guest/amenities":
      case "/guest/services":
        return <GuestAmenities onNavigate={handleNavigate} />;
      case "/guest/restaurant":
        return <GuestRestaurant onNavigate={handleNavigate} />;
      case "/guest/qa":
        return <GuestQA onNavigate={handleNavigate} />;
      case "/guest/laundry":
        return <GuestLaundry onNavigate={handleNavigate} />;
      case "/guest/places":
        return <GuestPlaces onNavigate={handleNavigate} />;
      case "/guest/tours":
        return <GuestTours onNavigate={handleNavigate} />;
      case "/guest/wellness":
        return <GuestWellness onNavigate={handleNavigate} />;
      case "/guest/gastronomy":
        return <GuestGastronomy onNavigate={handleNavigate} />;
      case "/guest/to-visit":
        return <GuestToVisit onNavigate={handleNavigate} />;
      default:
        return <GuestHome onNavigate={handleNavigate} />;
    }
  };

  if (!guestSession) {
    return null;
  }

  const { guestData, hotelData } = guestSession;

  // Construct guest name from personal data (first_name + last_name)
  const guestName =
    guestData.guest_personal_data?.first_name &&
    guestData.guest_personal_data?.last_name
      ? `${guestData.guest_personal_data.first_name} ${guestData.guest_personal_data.last_name}`.trim()
      : guestData.guest_name; // Fallback to guest_name if personal data not available

  return (
    <GuestThemeProvider hotelId={guestData.hotel_id}>
      <GuestCartProvider>
        <GuestNotificationProvider>
          <GuestPageLayout
            guestName={guestName}
            hotelName={hotelData.name}
            roomNumber={guestData.room_number}
            sessionId={guestData.session_id || ""}
            guestId={guestData.id}
            dndStatus={guestData.dnd_status}
            hotelId={guestData.hotel_id}
            currentPath={currentRoute}
            onNavigate={handleNavigate}
            onClockClick={handleClockClick}
          >
            {renderPage()}
          </GuestPageLayout>

          {/* Request History Bottom Sheet */}
          {/* Only show if at least one hotel service card is enabled */}
          {hasAnyHotelService && (
            <RequestHistoryBottomSheet
              isOpen={isRequestHistoryOpen}
              onClose={handleCloseRequestHistory}
              guestId={guestData.id}
              hotelId={guestData.hotel_id}
            />
          )}
        </GuestNotificationProvider>
      </GuestCartProvider>
    </GuestThemeProvider>
  );
};
