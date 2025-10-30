import type { GuestPlace } from "../maps/types";

/**
 * Extract photo reference from Google Maps URLs or direct references
 */
export const extractPhotoReference = (photoRef: string): string | null => {
  if (!photoRef) return null;

  // If it's already a clean reference (no http), return it
  if (!photoRef.startsWith("http")) {
    return photoRef;
  }

  // Try to extract from Google Maps JS API URL format
  const match = photoRef.match(/[?&]1s([^&]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Extract from photo_reference parameter
  const urlMatch = photoRef.match(/photo_reference=([^&]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return null;
};

/**
 * Transform thirdparty places data to map places format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformToMapPlaces = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placesData: any[],
  category: "gastronomy" | "wellness" | "tours"
): GuestPlace[] => {
  return placesData
    .map((item) => {
      const place = item.thirdparty_places;
      if (!place || !place.latitude || !place.longitude) return null;

      return {
        id: place.id,
        name: place.name || "Unknown",
        latitude: place.latitude,
        longitude: place.longitude,
        category,
        hotel_recommended: item.hotel_recommended || false,
        hotel_approved: true,
        vicinity: place.vicinity || place.formatted_address || "",
      };
    })
    .filter(Boolean) as GuestPlace[];
};

/**
 * Transform thirdparty places data to card format for list view
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformToCardPlaces = (placesData: any[], apiKey: string) => {
  return placesData
    .map((item) => {
      const place = item.thirdparty_places;

      if (!place) return null;

      // Build Google Places photo URL
      let photoUrl: string | undefined = undefined;

      if (place.photo_reference) {
        const photoRef = extractPhotoReference(place.photo_reference);
        if (photoRef) {
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
        }
      } else if (
        place.photos &&
        Array.isArray(place.photos) &&
        place.photos.length > 0
      ) {
        const firstPhoto = place.photos[0];
        if (firstPhoto.photo_reference) {
          const photoRef = extractPhotoReference(firstPhoto.photo_reference);
          if (photoRef) {
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;
          }
        }
      }

      return {
        id: place.id,
        title: place.name || "Unknown",
        description: place.vicinity || place.formatted_address || "",
        imageUrl: photoUrl,
        rating: place.rating || undefined,
        isRecommended: item.hotel_recommended || false,
      };
    })
    .filter(Boolean);
};

/**
 * Transform place data to google_data format for detail bottom sheet
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformToGoogleData = (place: any) => {
  return {
    formatted_address: place.formatted_address,
    vicinity: place.vicinity,
    rating: place.rating,
    user_ratings_total: place.user_ratings_total,
    price_level: place.price_level,
    opening_hours: place.opening_hours,
    formatted_phone_number: place.formatted_phone_number,
    international_phone_number: place.international_phone_number,
    website: place.website,
    url: place.google_maps_url,
    photos: place.photos,
    photo_reference: place.photo_reference,
    business_status: place.business_status,
    types: place.types,
    reviews: place.reviews,
    geometry:
      place.latitude && place.longitude
        ? {
            location: {
              lat: place.latitude,
              lng: place.longitude,
            },
          }
        : undefined,
  };
};
