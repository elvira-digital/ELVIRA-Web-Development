/**
 * This file is no longer used - guest analytics simplified to behavior tracking only
 *
 * Use useGuestMetrics hook instead for dashboard behavior data
 */

export function useGuestServiceUsage() {
  // Deprecated - use useGuestMetrics for dashboard behavior tracking
  return {
    serviceUsage: null,
    popularFeatures: null,
    isLoading: false,
    error: "This hook is deprecated. Use useGuestMetrics instead.",
    refresh: async () => {},
  };
}
