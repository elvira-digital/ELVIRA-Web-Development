/**
 * Google Geocoding Service
 * Handles address <-> coordinates conversion using Google Maps Geocoding API
 */

const GOOGLE_GEOCODING_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
const GOOGLE_GEOCODING_URL =
  "https://maps.googleapis.com/maps/api/geocode/json";

export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  formattedAddress?: string;
}

interface GeocodeResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
  };
  place_id: string;
  types: string[];
}

/**
 * Convert coordinates to address (Reverse Geocoding)
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Address components extracted from the geocoding result
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<AddressComponents> {
  if (!GOOGLE_GEOCODING_API_KEY) {
    throw new Error("Google Geocoding API key not configured");
  }

  const url = new URL(GOOGLE_GEOCODING_URL);
  url.searchParams.append("latlng", `${latitude},${longitude}`);
  url.searchParams.append("key", GOOGLE_GEOCODING_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Google Geocoding API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Geocoding API error: ${data.status}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error("No address found for these coordinates");
  }

  return parseAddressComponents(data.results[0]);
}

/**
 * Convert address to coordinates (Forward Geocoding)
 * @param address - Full address string
 * @returns Coordinates and parsed address components
 */
export async function getCoordinatesFromAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
  addressComponents: AddressComponents;
}> {
  if (!GOOGLE_GEOCODING_API_KEY) {
    throw new Error("Google Geocoding API key not configured");
  }

  const url = new URL(GOOGLE_GEOCODING_URL);
  url.searchParams.append("address", address);
  url.searchParams.append("key", GOOGLE_GEOCODING_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Google Geocoding API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Geocoding API error: ${data.status}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error("No coordinates found for this address");
  }

  const result = data.results[0];

  return {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    addressComponents: parseAddressComponents(result),
  };
}

/**
 * Parse address components from geocoding result
 */
function parseAddressComponents(result: GeocodeResult): AddressComponents {
  const components: AddressComponents = {
    formattedAddress: result.formatted_address,
  };

  // Extract address components
  for (const component of result.address_components) {
    const types = component.types;

    if (types.includes("street_number") || types.includes("route")) {
      // Combine street number and route for full street address
      if (!components.street) {
        components.street = "";
      }
      components.street += component.long_name + " ";
    }

    if (types.includes("locality") || types.includes("postal_town")) {
      components.city = component.long_name;
    }

    if (
      types.includes("administrative_area_level_1") ||
      types.includes("administrative_area_level_2")
    ) {
      components.state = component.long_name;
    }

    if (types.includes("country")) {
      components.country = component.long_name;
    }

    if (types.includes("postal_code")) {
      components.zipCode = component.long_name;
    }
  }

  // Clean up street address
  if (components.street) {
    components.street = components.street.trim();
  }

  return components;
}

/**
 * Validate if coordinates are valid
 */
export function areValidCoordinates(
  latitude: number | null,
  longitude: number | null
): boolean {
  if (latitude === null || longitude === null) {
    return false;
  }

  return (
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
  );
}

/**
 * Build full address string from components
 */
export function buildFullAddress(components: {
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}): string {
  const parts: string[] = [];

  if (components.address) parts.push(components.address);
  if (components.city) parts.push(components.city);
  if (components.zipCode) parts.push(components.zipCode);
  if (components.country) parts.push(components.country);

  return parts.join(", ");
}
