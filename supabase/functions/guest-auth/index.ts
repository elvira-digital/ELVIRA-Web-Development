import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { SignJWT } from "npm:jose@5.6.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
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

    const { roomNumber, verificationCode } = await req.json();

    // Validate required fields
    if (!roomNumber || !verificationCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Room number and verification code are required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("🔍 Guest auth - verifying guest with:", {
      roomNumber: roomNumber,
      verificationCode: verificationCode,
      codeLength: verificationCode?.length,
    });

    // Use the RPC function to verify guest credentials
    const { data: verificationResult, error: verifyError } =
      await supabaseAdmin.rpc("verify_guest_code", {
        p_room: roomNumber,
        p_code: verificationCode,
      });

    if (verifyError || !verificationResult || verificationResult.length === 0) {
      console.error("❌ Guest verification failed:", verifyError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid room number or verification code",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Extract the guest ID from the first row of results
    const guestId = verificationResult[0]?.id;

    if (!guestId) {
      console.error("❌ No guest ID returned from verification");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid room number or verification code",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("✅ Guest verification successful, guest ID:", guestId);

    console.log("📋 Verification details:", {
      verifiedGuestId: guestId,
      roomNumber: roomNumber,
      verificationCode: verificationCode,
      timestamp: new Date().toISOString(),
    });

    // Fetch the guest record data (room info, session, etc.)
    const { data: guestRecord, error: guestFetchError } = await supabaseAdmin
      .from("guests")
      .select(
        "id, hotel_id, room_number, access_code_expires_at, created_at, dnd_status, is_active, session_id"
      )
      .eq("id", guestId)
      .single();

    if (guestFetchError || !guestRecord) {
      console.error("❌ Error fetching guest record:", guestFetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error fetching guest information",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("✅ Guest record fetched:", {
      guestId: guestRecord.id,
      roomNumber: guestRecord.room_number,
      sessionId: guestRecord.session_id,
      isActive: guestRecord.is_active,
      hotelId: guestRecord.hotel_id,
    });

    // Fetch the specific personal data that matches this guest
    // This ensures we get the correct person's name in multi-guest rooms
    console.log("🔍 Fetching personal data for guest_id:", guestRecord.id);

    const { data: personalData, error: personalDataError } = await supabaseAdmin
      .from("guest_personal_data")
      .select(
        "guest_id, first_name, last_name, guest_email, country, language, hashed_verification_code"
      )
      .eq("guest_id", guestRecord.id)
      .single();

    if (personalDataError) {
      console.error("❌ Error fetching personal data:", personalDataError);
    }

    console.log("👤 Personal data fetched:", {
      guestId: personalData?.guest_id,
      firstName: personalData?.first_name,
      lastName: personalData?.last_name,
      email: personalData?.guest_email,
      country: personalData?.country,
      language: personalData?.language,
      hasHashedCode: !!personalData?.hashed_verification_code,
      hasError: !!personalDataError,
    });

    // Verify that this personal data matches the verification code entered
    // This is a double-check to ensure we have the right guest
    if (personalData?.hashed_verification_code) {
      console.log("🔐 Verifying personal data matches the entered code...");
      // Note: We can't verify the hash here without the crypt function,
      // but we're logging to help debug if the wrong record is fetched
    }

    // Construct the guest name from first_name and last_name
    const guestName = personalData
      ? `${personalData.first_name || ""} ${
          personalData.last_name || ""
        }`.trim() || "Guest"
      : "Guest";

    const completeGuestData = {
      id: guestRecord.id,
      hotel_id: guestRecord.hotel_id,
      room_number: guestRecord.room_number,
      guest_name: guestName,
      access_code_expires_at: guestRecord.access_code_expires_at,
      created_at: guestRecord.created_at,
      dnd_status: guestRecord.dnd_status,
      is_active: guestRecord.is_active,
      session_id: guestRecord.session_id,
      guest_personal_data: personalData
        ? {
            first_name: personalData.first_name,
            last_name: personalData.last_name,
            guest_email: personalData.guest_email,
            country: personalData.country,
            language: personalData.language,
          }
        : null,
    };

    console.log("📊 Complete guest data fetched:", {
      guestId: completeGuestData.id,
      guestName: completeGuestData.guest_name,
      firstName: personalData?.first_name,
      lastName: personalData?.last_name,
      sessionId: completeGuestData.session_id,
      createdAt: completeGuestData.created_at,
      personalData: completeGuestData.guest_personal_data,
      language: completeGuestData.guest_personal_data?.language,
    });

    // Check if access code has expired
    const expiresAt = new Date(completeGuestData.access_code_expires_at);
    const now = new Date();
    if (expiresAt < now) {
      console.log(
        "⏰ Access code expired for guest:",
        completeGuestData.guest_name
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "Access code has expired",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Fetch hotel details
    const { data: hotelData, error: hotelError } = await supabaseAdmin
      .from("hotels")
      .select(
        "name, city, country, reception_phone, official_languages, latitude, longitude"
      )
      .eq("id", completeGuestData.hotel_id)
      .maybeSingle();

    if (hotelError) {
      console.error("❌ Hotel query error:", hotelError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error fetching hotel information",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("🏨 Hotel data fetched:", hotelData);

    // Generate custom JWT for the guest
    const jwtSecret = Deno.env.get("ELVIRA_JWT_SECRET");
    if (!jwtSecret) {
      console.error("❌ JWT secret not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "JWT secret not configured",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({
      sub: completeGuestData.id,
      role: "authenticated",
      user_role: "guest",
      guest_id: completeGuestData.id,
      hotel_id: completeGuestData.hotel_id,
      room_number: completeGuestData.room_number,
      session_id: completeGuestData.session_id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresAt.getTime() / 1000)
      .setAudience("authenticated")
      .setIssuer("supabase")
      .sign(secretKey);

    // NOTE: Guests don't need profiles table entries
    // They use custom JWT authentication without Supabase Auth
    // Commenting out profile upsert to avoid foreign key constraint errors
    /*
    const { error: profileUpsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: completeGuestData.id,
          email: completeGuestData.guest_personal_data?.guest_email || "",
          role: "guest",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        }
      );

    if (profileUpsertError) {
      console.error("⚠️ Supabase Profile Upsert Error:", profileUpsertError);
    }
    */

    console.log("✅ Guest authentication successful - JWT created");

    console.log("🎯 Final response guestData structure:", {
      id: completeGuestData.id,
      hotel_id: completeGuestData.hotel_id,
      room_number: completeGuestData.room_number,
      guest_name: completeGuestData.guest_name,
      access_code_expires_at: completeGuestData.access_code_expires_at,
      created_at: completeGuestData.created_at,
      dnd_status: completeGuestData.dnd_status,
      is_active: completeGuestData.is_active,
      session_id: completeGuestData.session_id,
      guest_personal_data: completeGuestData.guest_personal_data,
    });

    // Return successful authentication with guest data and custom JWT
    const responseData = {
      success: true,
      token: token,
      guestData: {
        id: completeGuestData.id,
        hotel_id: completeGuestData.hotel_id,
        room_number: completeGuestData.room_number,
        guest_name: completeGuestData.guest_name,
        access_code_expires_at: completeGuestData.access_code_expires_at,
        created_at: completeGuestData.created_at,
        dnd_status: completeGuestData.dnd_status,
        is_active: completeGuestData.is_active,
        session_id: completeGuestData.session_id,
        guest_personal_data: completeGuestData.guest_personal_data,
      },
      hotelData: {
        name: hotelData?.name || "Unknown Hotel",
        city: hotelData?.city || null,
        country: hotelData?.country || null,
        reception_phone: hotelData?.reception_phone || null,
        latitude: hotelData?.latitude || null,
        longitude: hotelData?.longitude || null,
        official_languages: hotelData?.official_languages || null,
      },
    };

    console.log(
      "📤 Sending response with session_id:",
      responseData.guestData?.session_id
    );

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
