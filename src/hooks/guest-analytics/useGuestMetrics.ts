/**
 * Guest Behavior Metrics Hook
 *
 * Hook for fetching guest dashboard behavior data
 */

import { useState, useEffect } from "react";
import type {
  GuestBehaviorMetrics,
  LoadingState,
} from "../../types/guest-analytics";
import { fetchGuestBehaviorMetrics } from "../../services/guest-analytics";

interface UseGuestBehaviorReturn extends LoadingState {
  behaviorData: GuestBehaviorMetrics | null;
  refresh: () => Promise<void>;
}

export function useGuestMetrics(hotelId?: string): UseGuestBehaviorReturn {
  const [behaviorData, setBehaviorData] = useState<GuestBehaviorMetrics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(undefined);

        const data = await fetchGuestBehaviorMetrics(hotelId);
        setBehaviorData(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load guest behavior data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [hotelId]);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const data = await fetchGuestBehaviorMetrics(hotelId);
      setBehaviorData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load guest behavior data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    behaviorData,
    isLoading,
    error,
    refresh,
  };
}
