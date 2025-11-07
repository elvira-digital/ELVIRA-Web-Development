/**
 * Guest Laundry Page
 *
 * Displays available laundry services for guests
 */

import React, { useState, useMemo } from "react";
import { useGuestAuth, useGuestCart } from "../../../contexts/guest";
import { GuestLaundryHeader } from "./components";
import { MenuCategorySection } from "../shared/cards/menu-item";
import { useGuestLaundryServices } from "../../../hooks/guest-management/laundry";
import { LaundryCartBottomSheet } from "../cart";
import { trackItemInteraction } from "../../../services/guest-analytics/realTimeTracking";

interface GuestLaundryProps {
  onNavigate?: (path: string) => void;
}

export const GuestLaundry: React.FC<GuestLaundryProps> = ({ onNavigate }) => {
  const { guestSession } = useGuestAuth();
  const {
    laundryCartCount,
    addToLaundryCart,
    incrementLaundryItem,
    decrementLaundryItem,
    getLaundryItemQuantity,
  } = useGuestCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch active laundry services for the hotel
  const { data: services = [], isLoading } = useGuestLaundryServices(
    guestSession?.guestData?.hotel_id
  );

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, typeof services> = {};

    services.forEach((service) => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });

    return grouped;
  }, [services]);

  // Filter by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return servicesByCategory;
    }

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof services> = {};

    Object.entries(servicesByCategory).forEach(([category, items]) => {
      const filteredItems = items.filter(
        (service) =>
          service.description.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
      );

      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
      }
    });

    return filtered;
  }, [servicesByCategory, searchQuery]);

  if (!guestSession) {
    return null;
  }

  const handleCardClick = (itemId: string) => {
    const service = services.find((s) => s.id === itemId);
    if (service && guestSession?.guestData) {
      // Track interaction with this specific laundry service
      trackItemInteraction({
        guestId: guestSession.guestData.id,
        hotelId: guestSession.guestData.hotel_id,
        sessionId: guestSession.guestData.id,
        sectionType: "laundry",
        itemId: service.id,
        itemName: service.description,
        itemCategory: service.category,
        actionType: "click",
      });
    }
  };

  const handleAddItem = (itemId: string) => {
    const service = services.find((s) => s.id === itemId);
    if (service) {
      // Track add to cart interaction
      if (guestSession?.guestData) {
        trackItemInteraction({
          guestId: guestSession.guestData.id,
          hotelId: guestSession.guestData.hotel_id,
          sessionId: guestSession.guestData.id,
          sectionType: "laundry",
          itemId: service.id,
          itemName: service.description,
          itemCategory: service.category,
          actionType: "add_to_cart",
        });
      }

      addToLaundryCart({
        id: service.id,
        name: service.description,
        description: service.description,
        price: service.price,
        quantity: 1,
        category: service.category,
      });
      console.log("Item added to laundry cart");
    }
  };

  return (
    <>
      {/* Search Bar with Cart */}
      <GuestLaundryHeader
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={laundryCartCount}
        onCartClick={() => setIsCartOpen(true)}
        onBackClick={() => onNavigate?.("/guest/home")}
      />

      {/* Service Categories */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading laundry services...</p>
        </div>
      ) : Object.keys(filteredCategories).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery
              ? "No services found matching your search."
              : "No laundry services available at the moment."}
          </p>
        </div>
      ) : (
        Object.entries(filteredCategories).map(([category, items]) => (
          <MenuCategorySection
            key={category}
            categoryName={category}
            items={items.map((service) => ({
              id: service.id,
              title: service.description,
              description: `${service.category} service`,
              price: service.price,
              quantity: getLaundryItemQuantity(service.id),
            }))}
            onCardClick={handleCardClick}
            onAddClick={handleAddItem}
            onIncrement={incrementLaundryItem}
            onDecrement={decrementLaundryItem}
          />
        ))
      )}

      {/* Laundry Cart Bottom Sheet */}
      <LaundryCartBottomSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};
