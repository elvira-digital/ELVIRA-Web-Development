import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabase";
import type { Database } from "../../types/database";

type HotelInsert = Database["public"]["Tables"]["hotels"]["Insert"];

interface CreateHotelWithOwnerParams {
  hotel: HotelInsert & {
    contact_name: string;
    contact_last_name: string;
  };
}

/**
 * Create a hotel and automatically create/link the owner user
 * Uses the create-auth-hotel edge function
 *
 * IMPORTANT: We need to pass hotelId as null initially, then the edge function
 * will create the user first and then create the hotel with the correct owner_id
 */
export function useCreateHotelWithOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hotel }: CreateHotelWithOwnerParams) => {
      console.log("🏨 Creating hotel with owner...");

      // Get current session for authentication
      const { data: authData, error: authError } =
        await supabase.auth.getSession();

      if (authError || !authData.session) {
        console.error("❌ No active session");
        throw new Error("Authentication required");
      }

      // Call edge function to create user AND hotel together
      console.log("👤 Creating hotel owner and hotel...");

      const functionUrl = `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/create-auth-hotel`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactName: hotel.contact_name,
          contactLastName: hotel.contact_last_name,
          hotelData: {
            name: hotel.name,
            contact_email: hotel.contact_email,
            phone_number: hotel.phone_number,
            reception_phone: hotel.reception_phone,
            website: hotel.website,
            city: hotel.city,
            zip_code: hotel.zip_code,
            country: hotel.country,
            address: hotel.address,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            official_languages: hotel.official_languages,
            description: hotel.description,
            services: hotel.services,
            number_rooms: hotel.number_rooms,
            currency: hotel.currency,
            membership: hotel.membership,
            is_active: hotel.is_active,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Failed to create hotel and owner:", error);
        throw new Error(error.error || "Failed to create hotel and owner");
      }

      const result = await response.json();
      console.log("✅ Hotel and owner created:", result);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elvira-hotels"] });
    },
  });
}
