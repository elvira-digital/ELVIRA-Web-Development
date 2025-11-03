# Guest Session Structure - Updated

## Overview

This document explains the refactored guest session structure that supports multiple guests sharing the same room with individual access codes.

## Database Schema

### `guests` Table

**Purpose**: Tracks each individual guest and their room assignment

Key fields:

- `id` (uuid): Unique guest identifier
- `hotel_id` (uuid): Reference to hotel
- `session_id` (text): **Groups all guests in the same booking**
- `room_number` (text): Room assignment
- `guest_name` (text): Full name
- `hashed_verification_code` (text): Hashed access code (also stored in personal_data)
- `access_code_expires_at` (timestamp): When the code expires (checkout date)
- `is_active` (boolean): Whether guest is currently active
- `dnd_status` (boolean): Do Not Disturb status
- `created_by` (uuid): Staff member who created the record

**No unique constraint on `(hotel_id, room_number)`** - Multiple guests can share the same room!

### `guest_personal_data` Table

**Purpose**: Stores personal information and authentication data for each guest

Key fields:

- `guest_id` (uuid): Reference to guests table (one-to-one)
- `session_id` (text): **Same as guests table - links guests together**
- `hashed_verification_code` (text): **Individual guest's hashed access code**
- `first_name` (text): Guest's first name
- `last_name` (text): Guest's last name
- `guest_email` (text): Unique email per guest
- `phone_number` (text): Contact phone
- `date_of_birth` (date): Date of birth
- `country` (text): Country
- `language` (text): Preferred language

**Unique constraint on `(session_id, guest_email)`** - Each guest in a session must have unique email

## How It Works

### Multi-Guest Booking Flow

1. **Frontend generates `session_id`**:

   ```typescript
   const sessionId = crypto.randomUUID();
   ```

2. **Each guest gets their own access code**:

   ```typescript
   const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
   ```

3. **Edge function creates records**:
   - For each guest:
     - Hash their individual access code
     - Insert into `guests` table with `session_id`
     - Insert into `guest_personal_data` table with same `session_id` and `hashed_verification_code`

### Example: Family of 3 in Room 305

**Session ID**: `7d4f937a-c809-40ab-b74b-a188bc49914`

| Table  | guest_name | session_id  | room_number | access_code    | email            |
| ------ | ---------- | ----------- | ----------- | -------------- | ---------------- |
| guests | John Smith | 7d4f937a... | 305         | (hashed)123456 | john@example.com |
| guests | Jane Smith | 7d4f937a... | 305         | (hashed)789012 | jane@example.com |
| guests | Tim Smith  | 7d4f937a... | 305         | (hashed)345678 | tim@example.com  |

All three:

- Share the same `session_id`
- Share the same `room_number`
- Have **different** `hashed_verification_code`
- Have **unique** email addresses

## Authentication

When a guest logs in:

1. Enter email and access code
2. Backend queries `guest_personal_data` by email
3. Compares hashed code
4. Returns guest info with `session_id`
5. Can then query all guests in same session if needed

## Database Queries

### Get all guests in a session

```sql
SELECT g.*, gpd.*
FROM guests g
JOIN guest_personal_data gpd ON gpd.guest_id = g.id
WHERE g.session_id = 'session-uuid'
ORDER BY g.created_at;
```

### Get guest by email and verify code

```sql
SELECT gpd.*, g.*
FROM guest_personal_data gpd
JOIN guests g ON g.id = gpd.guest_id
WHERE gpd.guest_email = 'guest@example.com'
AND gpd.hashed_verification_code = crypt('123456', gpd.hashed_verification_code);
```

### Get all guests in a room

```sql
SELECT g.*, gpd.*
FROM guests g
JOIN guest_personal_data gpd ON gpd.guest_id = g.id
WHERE g.hotel_id = 'hotel-uuid'
AND g.room_number = '305'
AND g.is_active = true
ORDER BY g.created_at;
```

## Migration

Run `database/migrations/007_refactor_guest_session_structure.sql` to:

- Ensure `session_id` and `hashed_verification_code` exist in `guest_personal_data`
- Remove unique constraint on `(hotel_id, room_number)` in `guests` table
- Add indexes for performance
- Add unique constraint on `(session_id, guest_email)`

## Edge Function

**Endpoint**: `/functions/v1/create-guest`

**Request Body**:

```json
{
  "hotelId": "uuid",
  "sessionId": "uuid", // Generated client-side
  "roomNumber": "305",
  "checkoutDate": "2025-11-15T12:00:00Z",
  "isActive": true,
  "dndStatus": false,
  "guests": [
    {
      "verificationCode": "123456",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1980-05-15",
      "country": "US",
      "language": "en"
    },
    {
      "verificationCode": "789012",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+1234567891",
      "dateOfBirth": "1982-08-20",
      "country": "US",
      "language": "en"
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "sessionId": "7d4f937a-c809-40ab-b74b-a188bc49914",
  "roomNumber": "305",
  "guestsCreated": 2,
  "guests": [
    { "id": "uuid1", "name": "John Smith", "email": "john@example.com" },
    { "id": "uuid2", "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "emailResults": [...],
  "roomCleaningCreated": true
}
```

## Benefits

✅ **Multiple guests per room**: No unique constraint on room_number  
✅ **Individual authentication**: Each guest has their own access code  
✅ **Grouped bookings**: `session_id` links guests together  
✅ **Unique emails**: Each guest must have unique email within session  
✅ **Efficient queries**: Indexes on `session_id` for fast lookups  
✅ **Data integrity**: Foreign keys and constraints ensure consistency

## Next Steps

1. ✅ Run migration: `007_refactor_guest_session_structure.sql`
2. ✅ Deploy edge function: `create-guest`
3. ✅ Integrate with frontend form
4. 🔄 Test with multiple guests
5. 🔄 Update guest login to use email + access code
