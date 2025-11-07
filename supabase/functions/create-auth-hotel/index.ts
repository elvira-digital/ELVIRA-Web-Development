import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  contactName: string;
  contactLastName: string;
  hotelData: {
    name: string;
    contact_email?: string | null;
    phone_number?: string | null;
    reception_phone?: string | null;
    website?: string | null;
    city?: string | null;
    zip_code?: string | null;
    country?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    official_languages?: string[] | null;
    description?: string | null;
    services?: string[] | null;
    number_rooms?: number | null;
    currency?: string | null;
    membership?: string | null;
    is_active?: boolean;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { contactName, contactLastName, hotelData }: RequestBody =
      await req.json();

    console.log("📨 Received request:", {
      contactName,
      contactLastName,
      hotelName: hotelData.name,
    });

    // Validate required fields
    if (!contactName || !contactLastName) {
      throw new Error("Contact name and last name are required");
    }

    if (!hotelData || !hotelData.name) {
      throw new Error("Hotel data with name is required");
    }

    // 1. Create email from contact name and last name
    const email = `${contactName}.${contactLastName}@elviradc.com`
      .toLowerCase()
      .replace(/\s+/g, "");

    console.log("📧 Creating user with email:", email);

    // 2. Create authenticated user
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: "elvira123",
        email_confirm: true,
        user_metadata: {
          contact_name: contactName,
          contact_last_name: contactLastName,
        },
      });

    if (userError || !userData.user) {
      console.error("❌ Failed to create user:", userError);
      throw new Error(userError?.message || "Failed to create user");
    }

    console.log("✅ User created:", userData.user.id);

    // 3. Check if profile exists, if not create it, then update with role = 'hotel'
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userData.user.id)
      .single();

    if (!existingProfile) {
      console.log("📝 Creating profile for user...");
      // Profile doesn't exist, create it
      const { error: createProfileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userData.user.id,
          email: email,
          role: "hotel",
        });

      if (createProfileError) {
        console.error("❌ Failed to create profile:", createProfileError);
        // Rollback: delete the user
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        throw new Error(
          createProfileError.message || "Failed to create profile"
        );
      }
      console.log("✅ Profile created with role=hotel");
    } else {
      console.log("📝 Updating existing profile...");
      // Profile exists, update it
      const { error: updateProfileError } = await supabaseAdmin
        .from("profiles")
        .update({
          email: email,
          role: "hotel",
        })
        .eq("id", userData.user.id);

      if (updateProfileError) {
        console.error("❌ Failed to update profile:", updateProfileError);
        // Rollback: delete the user
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        throw new Error(
          updateProfileError.message || "Failed to update profile"
        );
      }
      console.log("✅ Profile updated with role=hotel");
    }

    // 4. Create hotel with the user as owner
    const { data: createdHotel, error: hotelError } = await supabaseAdmin
      .from("hotels")
      .insert({
        ...hotelData,
        owner_id: userData.user.id,
        contact_name: contactName,
        contact_last_name: contactLastName,
      })
      .select()
      .single();

    if (hotelError || !createdHotel) {
      console.error("❌ Failed to create hotel:", hotelError);
      // Rollback: delete the user and profile
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error(hotelError?.message || "Failed to create hotel");
    }

    console.log("✅ Hotel created:", createdHotel.id);

    // 5. Create hotel_staff record for the owner
    console.log("👥 Creating hotel_staff record...");
    const { error: staffError } = await supabaseAdmin
      .from("hotel_staff")
      .insert({
        id: userData.user.id,
        hotel_id: createdHotel.id,
        employee_id: "OWNER-001",
        position: "Hotel Admin",
        department: "Manager",
        status: "active",
      });

    if (staffError) {
      console.error("❌ Failed to create hotel_staff:", staffError);
      // Rollback: delete hotel and user
      await supabaseAdmin.from("hotels").delete().eq("id", createdHotel.id);
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error(staffError.message || "Failed to create hotel staff");
    }

    console.log("✅ Hotel staff record created");

    // 6. Create hotel_staff_personal_data record
    console.log("📋 Creating staff personal data...");
    const { error: personalDataError } = await supabaseAdmin
      .from("hotel_staff_personal_data")
      .insert({
        staff_id: userData.user.id,
        first_name: contactName,
        last_name: contactLastName,
        email: email,
      });

    if (personalDataError) {
      console.error("❌ Failed to create personal data:", personalDataError);
      // Rollback: delete everything
      await supabaseAdmin
        .from("hotel_staff")
        .delete()
        .eq("id", userData.user.id);
      await supabaseAdmin.from("hotels").delete().eq("id", createdHotel.id);
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error(
        personalDataError.message || "Failed to create personal data"
      );
    }

    console.log("✅ Personal data created");

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.user.id,
          email: userData.user.email,
        },
        hotel: {
          id: createdHotel.id,
          name: createdHotel.name,
        },
        message: "Hotel and owner created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
