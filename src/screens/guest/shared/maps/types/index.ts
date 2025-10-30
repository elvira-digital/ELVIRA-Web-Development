export interface GuestPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  hotel_recommended?: boolean;
  hotel_approved?: boolean;
  vicinity?: string;
}

export interface GuestPlacesMapViewProps {
  places: GuestPlace[];
  hotelLocation: { lat: number; lng: number };
  hotelName: string;
  category?: string;
  onPlaceClick?: (place: GuestPlace) => void;
}
