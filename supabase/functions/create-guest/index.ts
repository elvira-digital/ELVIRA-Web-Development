// supabase/functions/create-guest/index.ts
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  console.log("🚀 Edge function invoked:", {
    method: req.method,
    url: req.url,
    hasAuthHeader: req.headers.has("Authorization"),
  });

  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request, returning CORS headers");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticated user
    const authHeader = req.headers.get("Authorization");
    console.log(
      "🔐 Auth header:",
      authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : "MISSING"
    );

    const jwt = authHeader?.replace("Bearer ", "");
    if (!jwt) {
      console.error("❌ No JWT token found in Authorization header");
      return unauthorized();
    }

    console.log("✅ JWT token found, verifying user...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("❌ Failed to get user:", userError);
      return unauthorized();
    }

    if (!user) {
      console.error("❌ No user found in session");
      return unauthorized();
    }

    console.log("✅ User authenticated:", {
      userId: user.id,
      email: user.email,
    });

    const authenticatedUserId = user.id;

    // 2. Admin client
    console.log("🔧 Creating admin client...");
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
    console.log("✅ Admin client created");

    // 3. Parse body
    console.log("📦 Parsing request body...");
    const {
      hotelId,
      sessionId, // Required: UUID for the session
      roomNumber,
      checkoutDate,
      guests, // Array of guest objects
      isActive,
      dndStatus,
    } = await req.json();

    console.log("📋 Request data:", {
      hotelId,
      sessionId,
      roomNumber,
      checkoutDate,
      guestCount: guests?.length,
    });

    if (
      !hotelId ||
      !sessionId ||
      !roomNumber ||
      !checkoutDate ||
      !guests ||
      guests.length === 0
    ) {
      console.error("❌ Missing required fields");
      return badRequest(
        "Missing required fields: hotelId, sessionId, roomNumber, checkoutDate, and guests array"
      );
    }

    console.log("📦 Creating guest session:", {
      sessionId,
      roomNumber,
      guestCount: guests.length,
    });

    const createdGuests = [];
    let roomCleaningCreated = false;

    // 4. Loop through all guests and create them
    console.log(`👥 Processing ${guests.length} guest(s)...`);

    for (let i = 0; i < guests.length; i++) {
      const guestData = guests[i];
      console.log(`\n👤 Processing guest ${i + 1}/${guests.length}:`, {
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
      });

      const {
        verificationCode,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        country,
        language,
      } = guestData;

      // Validate each guest
      if (
        !verificationCode ||
        !firstName ||
        !lastName ||
        !email ||
        !country ||
        !language
      ) {
        console.error("❌ Invalid guest data - missing required fields:", {
          hasCode: !!verificationCode,
          hasFirstName: !!firstName,
          hasLastName: !!lastName,
          hasEmail: !!email,
          hasCountry: !!country,
          hasLanguage: !!language,
        });
        continue; // Skip invalid guests
      }

      // Hash verification code for this guest
      console.log(
        `🔐 Hashing verification code for ${firstName} ${lastName}...`
      );
      const { data: hashed, error: hashError } = await supabaseAdmin.rpc(
        "hash_verification_code",
        {
          code: verificationCode,
        }
      );

      if (hashError || !hashed) {
        console.error("❌ Failed to hash code:", hashError);
        continue;
      }
      console.log("✅ Code hashed successfully");

      // Insert guest record
      const guestName = `${firstName} ${lastName}`;
      console.log(`💾 Inserting guest record for ${guestName}...`);

      const { data: insertedGuest, error: guestError } = await supabaseAdmin
        .from("guests")
        .insert({
          hotel_id: hotelId,
          session_id: sessionId, // Link to session
          room_number: roomNumber,
          hashed_verification_code: hashed, // Store in guests table too for now
          guest_name: guestName,
          access_code_expires_at: new Date(checkoutDate).toISOString(),
          is_active: isActive ?? true,
          dnd_status: dndStatus ?? false,
          created_by: authenticatedUserId,
        })
        .select()
        .single();

      if (guestError) {
        console.error("❌ Failed to create guest:", {
          error: guestError,
          code: guestError.code,
          message: guestError.message,
          details: guestError.details,
        });
        continue;
      }

      console.log("✅ Guest record created:", insertedGuest.id);

      // Insert guest personal data with session_id and hashed_verification_code
      const formattedDob = dateOfBirth
        ? new Date(dateOfBirth).toISOString().split("T")[0]
        : null;

      console.log(`💾 Inserting personal data for ${guestName}...`);
      const { error: personalError } = await supabaseAdmin
        .from("guest_personal_data")
        .insert({
          guest_id: insertedGuest.id,
          session_id: sessionId, // Store session_id here too
          hashed_verification_code: hashed, // Store hashed code for authentication
          first_name: firstName,
          last_name: lastName,
          guest_email: email,
          phone_number: phone || null,
          date_of_birth: formattedDob,
          country,
          language,
        });

      if (personalError) {
        console.error("❌ Failed to create personal data:", {
          error: personalError,
          code: personalError.code,
          message: personalError.message,
          details: personalError.details,
        });
        // Rollback guest
        console.log("🔄 Rolling back guest record...");
        await supabaseAdmin.from("guests").delete().eq("id", insertedGuest.id);
        continue;
      }

      console.log("✅ Guest personal data created for:", guestName);
      createdGuests.push({
        id: insertedGuest.id,
        name: guestName,
        email,
        verificationCode, // For email sending
      });

      // Create room_cleaning_status only once for the first guest
      if (!roomCleaningCreated) {
        const { error: cleaningError } = await supabaseAdmin
          .from("room_cleaning_status")
          .insert({
            hotel_id: hotelId,
            room_number: roomNumber,
            cleaning_status: "NOT_CLEAN",
            created_by: authenticatedUserId,
            updated_by: authenticatedUserId,
          });

        if (cleaningError) {
          console.error(
            "❌ Failed to create room cleaning status:",
            cleaningError
          );
          // Don't fail the entire operation, just log it
        } else {
          roomCleaningCreated = true;
          console.log("✅ Room cleaning status created for room:", roomNumber);
        }
      }
    }

    if (createdGuests.length === 0) {
      return badRequest("No guests were created successfully");
    }

    // 5. Send welcome emails to all guests
    const emailResults = [];
    try {
      const { data: hotelData } = await supabaseAdmin
        .from("hotels")
        .select("name")
        .eq("id", hotelId)
        .single();

      const hotelName = hotelData?.name || "Our Hotel";
      const emailApiUrl = `${Deno.env.get(
        "SUPABASE_URL"
      )}/functions/v1/send-guest-credentials-email`;

      for (const guest of createdGuests) {
        try {
          const emailResponse = await fetch(emailApiUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              guestName: guest.name,
              guestEmail: guest.email,
              roomNumber,
              verificationCode: guest.verificationCode,
              codeExpiresAt: checkoutDate,
              hotelName,
            }),
          });

          const emailResult = await emailResponse.json();
          emailResults.push({
            guest: guest.name,
            sent: emailResponse.ok,
            result: emailResult,
          });

          if (emailResponse.ok) {
            console.log("✅ Email sent to:", guest.email);
          } else {
            console.warn("⚠️ Email failed for:", guest.email, emailResult);
          }
        } catch (err) {
          console.error("💥 Email error for:", guest.email, err);
          emailResults.push({
            guest: guest.name,
            sent: false,
            error: String(err),
          });
        }
      }
    } catch (err) {
      console.error("💥 Email processing error:", err);
    }

    // 6. Final response
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: sessionId,
        roomNumber,
        guestsCreated: createdGuests.length,
        guests: createdGuests.map((g) => ({
          id: g.id,
          name: g.name,
          email: g.email,
        })),
        emailResults,
        roomCleaningCreated,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("💥 Unexpected error:", err);
    return serverError(String(err));
  }
});

/* ---------- Helpers ---------- */
const unauthorized = () =>
  new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: corsHeaders,
  });

const badRequest = (msg: string) =>
  new Response(JSON.stringify({ error: msg }), {
    status: 400,
    headers: corsHeaders,
  });

const serverError = (msg: string) =>
  new Response(JSON.stringify({ error: msg }), {
    status: 500,
    headers: corsHeaders,
  });
