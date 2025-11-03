import { ToggleCard } from "./ToggleCard";

interface GuestServicesSectionProps {
  settings: {
    hotelAmenities: boolean;
    hotelShop: boolean;
    hotelLaundry: boolean;
    toursExcursions: boolean;
    roomServiceRestaurant: boolean;
    localRestaurants: boolean;
    wellness: boolean;
    placesToVisit: boolean;
    liveChatSupport: boolean;
  };
  onToggle: (
    key: keyof GuestServicesSectionProps["settings"],
    value: boolean
  ) => void;
}

export function GuestServicesSection({
  settings,
  onToggle,
}: GuestServicesSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900">Guest Services</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          }
          title="Hotel Amenities"
          description="Hotel facilities and services information"
          isEnabled={settings.hotelAmenities}
          onToggle={(value) => onToggle("hotelAmenities", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
          title="Hotel Shop"
          description="Purchase hotel merchandise and essentials"
          isEnabled={settings.hotelShop}
          onToggle={(value) => onToggle("hotelShop", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0M5 7h14l-1 14H6L5 7z"
              />
            </svg>
          }
          title="Laundry"
          description="Laundry services and order management"
          isEnabled={settings.hotelLaundry}
          onToggle={(value) => onToggle("hotelLaundry", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          title="Tours & Excursions"
          description="Book local tours and activities"
          isEnabled={settings.toursExcursions}
          onToggle={(value) => onToggle("toursExcursions", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          title="Room Service & Hotel Restaurant"
          description="Order food from hotel restaurant or room service"
          isEnabled={settings.roomServiceRestaurant}
          onToggle={(value) => onToggle("roomServiceRestaurant", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          title="Local Restaurants"
          description="Discover and book local dining options"
          isEnabled={settings.localRestaurants}
          onToggle={(value) => onToggle("localRestaurants", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
          title="Wellness & Spa"
          description="Spa and wellness services"
          isEnabled={settings.wellness}
          onToggle={(value) => onToggle("wellness", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          }
          title="Places to Visit"
          description="Discover must-see locations nearby"
          isEnabled={settings.placesToVisit}
          onToggle={(value) => onToggle("placesToVisit", value)}
        />

        <ToggleCard
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
          title="Live Chat Support"
          description="Direct communication with hotel reception"
          isEnabled={settings.liveChatSupport}
          onToggle={(value) => onToggle("liveChatSupport", value)}
        />
      </div>
    </div>
  );
}
