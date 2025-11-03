# Guest Sessions - Multi-Guest Booking System

## Overview

This system allows multiple guests to be part of the same room booking using a simple `session_id` field. All guests sharing the same `session_id` are in the same room, but each maintains their own access code and personal information.

## Database Structure

We use the existing 2 tables:

### `guests` Table

**Purpose:** Represents individual guest accounts

**Key Columns:**

- `id` - Guest unique identifier
- `hotel_id` - Reference to the hotel
- `session_id` - **NEW** - Text field linking guests together (e.g., "session_abc123")
- `room_number` - The assigned room number (shared by all guests in session)
- `hashed_verification_code` - Each guest's own secure access code
- `access_code_expire_at` - When their code expires (checkout date)
- `is_active` - Whether this specific guest is active
- `dnd_status` - Do Not Disturb status
- `created_at` / `updated_at` - Timestamps

### `guest_personal_data` Table

**Purpose:** Personal information for each guest

**Key Columns:**

- `guest_id` - References `guests.id`
- `first_name` - Guest's first name
- `last_name` - Guest's last name
- `guest_email` - Email address
- `phone_number` - Phone number
- `date_of_birth` - Date of birth
- `country` - Country
- `language` - Preferred language

## How It Works

### Example: Family of 4 Booking Room 305

**All share the same `session_id` but each has their own access code:**

```
guests table:
┌─────────────────────────────────────────────────────────────┐
│ Guest 1 (Dad)                                               │
│ - session_id: "session_2025_305_abc"                        │
│ - room_number: "305"                                        │
│ - hashed_verification_code: hash("123456")                  │
│ - access_code_expire_at: "2025-11-15"                       │
├─────────────────────────────────────────────────────────────┤
│ Guest 2 (Mom)                                               │
│ - session_id: "session_2025_305_abc"  ← Same session!      │
│ - room_number: "305"                                        │
│ - hashed_verification_code: hash("789012")  ← Different!    │
│ - access_code_expire_at: "2025-11-15"                       │
├─────────────────────────────────────────────────────────────┤
│ Guest 3 (Son)                                               │
│ - session_id: "session_2025_305_abc"  ← Same session!      │
│ - room_number: "305"                                        │
│ - hashed_verification_code: hash("345678")  ← Different!    │
│ - access_code_expire_at: "2025-11-15"                       │
├─────────────────────────────────────────────────────────────┤
│ Guest 4 (Daughter)                                          │
│ - session_id: "session_2025_305_abc"  ← Same session!      │
│ - room_number: "305"                                        │
│ - hashed_verification_code: hash("901234")  ← Different!    │
│ - access_code_expire_at: "2025-11-15"                       │
└─────────────────────────────────────────────────────────────┘

guest_personal_data table:
┌─────────────────────────────────────┐
│ Guest 1: John Smith (Dad)           │
│ Guest 2: Jane Smith (Mom)           │
│ Guest 3: Tommy Smith (Son)          │
│ Guest 4: Sarah Smith (Daughter)     │
└─────────────────────────────────────┘
```

### Session ID Format

You can use any format, suggestions:

- `"session_{timestamp}_{room}_{random}"` → `"session_1730400000_305_abc123"`
- `"uuid"` → `"550e8400-e29b-41d4-a716-446655440000"`
- `"{hotelId}_{room}_{date}_{random}"` → `"hotel1_305_20251101_xyz"`

### Authentication Flow

1. Guest enters their **unique 6-digit code** (e.g., "123456")
2. System uses `hash_verification_code` RPC function to hash it
3. Looks up guest by `hotel_id` + `hashed_verification_code`
4. Guest logs in with their own name
5. Can see other guests in same session via `session_id`

### Benefits

✅ **Simple** - Just add one TEXT column, no new table needed
✅ **Personalization** - Each guest has their own account, name, preferences
✅ **Security** - Each guest has their own unique access code
✅ **Grouped** - Query all guests by session_id to see who's in the same room
✅ **Flexible** - Easy to add/remove guests from a session

## Implementation

### Creating a Booking with Multiple Guests

```typescript
// Generate a unique session ID for this booking
const sessionId = `session_${Date.now()}_${roomNumber}_${generateRandomString()}`;

// Create each guest with the same session_id
for (const guestData of guests) {
  // 1. Create guest record
  const { data: guest } = await supabase
    .from("guests")
    .insert({
      hotel_id: hotelId,
      session_id: sessionId, // Same for all guests in this booking
      room_number: roomNumber, // Same room
      access_code_expire_at: checkoutDate, // Same checkout
      is_active: true,
    })
    .select()
    .single();

  // 2. Hash their unique access code
  await supabase.rpc("hash_verification_code", {
    guest_id: guest.id,
    code: guestData.accessCode, // Their unique 6-digit code
  });

  // 3. Create their personal data
  await supabase.from("guest_personal_data").insert({
    guest_id: guest.id,
    first_name: guestData.firstName,
    last_name: guestData.lastName,
    guest_email: guestData.email,
    phone_number: guestData.phoneNumber,
    date_of_birth: guestData.dateOfBirth,
    country: guestData.country,
    language: guestData.language,
  });
}
```

### Finding All Guests in Same Room

```typescript
// Get all guests in the same session
const { data: allGuestsInRoom } = await supabase
  .from("guests")
  .select("*, guest_personal_data(*)")
  .eq("session_id", currentGuest.session_id);

// Results: All 4 family members
```

### Guest Login

```typescript
// Guest enters their code "123456"
const { data: guest } = await supabase
  .from("guests")
  .select("*, guest_personal_data(*)")
  .eq("hotel_id", hotelId)
  .eq("hashed_verification_code", hashedCode)
  .single();

// Now can get other guests in same room:
const { data: roommates } = await supabase
  .from("guests")
  .select("*, guest_personal_data(*)")
  .eq("session_id", guest.session_id);
```

## Migration File

Location: `database/migrations/006_create_guest_sessions.sql`

**What it does:**

1. Adds `session_id` TEXT column to `guests` table
2. Creates index on `(hotel_id, session_id)` for fast queries
3. Adds helpful comments

**Preserves all existing columns:**

- `room_number` - The room for this booking
- `hashed_verification_code` - Each guest's secure code
- `access_code_expire_at` - Code expiration (checkout date)
- `is_active` - Guest account status
- All other existing fields

## Key Points

1. **Same session_id** = Same room booking
2. **Different hashed_verification_code** = Each guest can login individually
3. **Two tables only** = `guests` + `guest_personal_data` (no third table needed)
4. **Room number stays** = Still stored in guests table for convenience
5. **Simple queries** = Just filter by session_id to get all guests in room
