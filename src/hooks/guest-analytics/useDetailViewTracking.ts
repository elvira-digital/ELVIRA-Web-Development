/**
 * Hook to track detail view duration
 *
 * Tracks how long a user views an item's detail modal/bottom sheet
 */

import { useEffect, useRef } from "react";
import { trackItemInteraction } from "../../services/guest-analytics/realTimeTracking";

interface DetailViewTrackingParams {
  isOpen: boolean;
  guestId?: string;
  hotelId?: string;
  sessionId?: string;
  sectionType: string;
  itemId?: string;
  itemName?: string;
  itemCategory?: string;
}

export function useDetailViewTracking({
  isOpen,
  guestId,
  hotelId,
  sessionId,
  sectionType,
  itemId,
  itemName,
  itemCategory,
}: DetailViewTrackingParams) {
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // When modal opens, record start time
    if (isOpen && itemId && itemName && guestId && hotelId && sessionId) {
      startTimeRef.current = Date.now();
      console.log("⏱️ Started tracking detail view for:", itemName);
    }

    // When modal closes, calculate duration and track
    return () => {
      if (
        startTimeRef.current &&
        itemId &&
        itemName &&
        guestId &&
        hotelId &&
        sessionId
      ) {
        const durationMs = Date.now() - startTimeRef.current;
        const durationSeconds = Math.floor(durationMs / 1000);

        // Only track if they viewed for at least 1 second
        if (durationSeconds >= 1) {
          console.log(
            `⏱️ Finished tracking detail view: ${itemName} (${durationSeconds}s)`
          );

          trackItemInteraction({
            guestId,
            hotelId,
            sessionId,
            sectionType,
            itemId,
            itemName,
            itemCategory: itemCategory || undefined,
            actionType: "detail_view",
            durationSeconds,
          });
        }

        startTimeRef.current = null;
      }
    };
  }, [
    isOpen,
    guestId,
    hotelId,
    sessionId,
    sectionType,
    itemId,
    itemName,
    itemCategory,
  ]);
}
