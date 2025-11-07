/**
 * Google Maps Loader
 * Dynamically loads Google Maps JavaScript API with Places library
 */

let isLoading = false;
let isLoaded = false;

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Load Google Maps API dynamically
 */
export function loadGoogleMapsAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (isLoaded && window.google && window.google.maps) {
      resolve();
      return;
    }

    // Currently loading
    if (isLoading) {
      // Wait for loading to complete
      const checkInterval = setInterval(() => {
        if (isLoaded && window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    // Check if API key is configured
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn(
        "⚠️ Google Maps API key not configured. Address autocomplete will not work."
      );
      reject(new Error("Google Maps API key not configured"));
      return;
    }

    isLoading = true;

    // Create callback function
    window.initMap = () => {
      console.log("✅ Google Maps API loaded successfully");
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Handle errors
    script.onerror = () => {
      console.error("❌ Failed to load Google Maps API");
      isLoading = false;
      reject(new Error("Failed to load Google Maps API"));
    };

    // Append to document
    document.head.appendChild(script);
  });
}

/**
 * Check if Google Maps API is loaded
 */
export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google && !!window.google.maps;
}

// Declare global types
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    initMap: () => void;
  }
}
