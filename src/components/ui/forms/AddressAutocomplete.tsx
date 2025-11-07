import { useEffect, useRef } from "react";
import { Input } from "../forms";
import { getCountryCode } from "../../../utils/countryMapping";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: {
    address: string;
    city?: string;
    country?: string;
    zipCode?: string;
    latitude: number;
    longitude: number;
  }) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
}

/**
 * AddressAutocomplete - Input field with Google Places Autocomplete
 * Provides address suggestions as user types and extracts location details
 */
export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  label = "Address",
  placeholder = "Start typing to search for an address...",
  disabled = false,
  required = false,
  error,
  id = "address-autocomplete-input",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (disabled) return;

    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.warn("Google Maps API not loaded yet");
      return;
    }

    // Wait for the input to be rendered
    const inputElement = document.getElementById(id) as HTMLInputElement;
    if (!inputElement) return;

    inputRef.current = inputElement;

    // Initialize autocomplete with address-specific settings
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputElement,
      {
        types: ["geocode", "establishment"],
        fields: ["formatted_address", "address_components", "geometry", "name"],
      }
    );

    // Listen for place selection
    const placeChangedListener = () => {
      if (!autocompleteRef.current) return;

      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.geometry.location) {
        console.warn("No geometry found for selected place");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const formattedAddress = place.formatted_address || "";

      // Update the input value
      onChange(formattedAddress);

      // Extract address components
      if (onPlaceSelected && place.address_components) {
        const addressData = parseAddressComponents(
          place.address_components,
          formattedAddress,
          lat,
          lng
        );
        onPlaceSelected(addressData);
      }
    };

    autocompleteRef.current.addListener("place_changed", placeChangedListener);

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [disabled, id, onChange, onPlaceSelected]);

  return (
    <Input
      id={id}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
    />
  );
}

/**
 * Parse Google Maps address components into structured data
 */
function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[],
  formattedAddress: string,
  latitude: number,
  longitude: number
): {
  address: string;
  city?: string;
  country?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
} {
  const result: {
    address: string;
    city?: string;
    country?: string;
    zipCode?: string;
    latitude: number;
    longitude: number;
  } = {
    address: formattedAddress,
    latitude,
    longitude,
  };

  for (const component of components) {
    const types = component.types;

    if (types.includes("locality") || types.includes("postal_town")) {
      result.city = component.long_name;
    }

    if (types.includes("country")) {
      // Store the full country name, then convert to code
      const countryName = component.long_name;
      result.country = getCountryCode(countryName);
    }

    if (types.includes("postal_code")) {
      result.zipCode = component.long_name;
    }
  }

  return result;
}
