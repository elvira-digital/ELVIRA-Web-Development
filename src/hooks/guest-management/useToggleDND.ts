import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGuestSupabaseClient } from "../../services/guestSupabase";

interface ToggleDNDParams {
  sessionId: string;
  currentStatus: boolean;
}

/**
 * Toggle guest DND (Do Not Disturb) status
 * Updates all guests in the same session (room) at once
 * Uses guest Supabase client to ensure proper authentication context
 */
export function useToggleDND() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, currentStatus }: ToggleDNDParams) => {
      const guestSupabase = getGuestSupabaseClient();

      console.log(
        `🔄 Toggling DND for session ${sessionId} from ${currentStatus} to ${!currentStatus}`
      );

      // Update all guests with the same session_id (same room booking)
      const { data, error } = await guestSupabase
        .from("guests")
        .update({ dnd_status: !currentStatus })
        .eq("session_id", sessionId)
        .select();

      if (error) {
        console.error("[useToggleDND] Error updating DND status:", error);
        throw error;
      }

      console.log(
        `✅ DND status updated for ${
          data?.length || 0
        } guests in session ${sessionId}:`,
        data
      );

      return data;
    },
    onSuccess: () => {
      // Invalidate any guest-related queries if needed
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}
