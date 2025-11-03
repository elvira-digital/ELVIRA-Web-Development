# Guest Session Integration Guide

## Overview

The guest management system has been updated to support multi-guest bookings where all guests in the same room share a `session_id` but each has their own unique access code for authentication.

## What's Implemented

### ✅ Frontend Components

- **AddGuestModal**: Updated to handle multiple guests with individual access codes
- **GuestFormFields**: Includes access code field with generate button and explanatory text
- **GuestNavigation**: Allows adding/removing guests and navigating between them

### ✅ Service Layer

- **`guest-service.ts`**: Contains:
  - `createGuestSession()`: Calls the edge function to create guest session
  - `validateGuestForm()`: Validates all guest data including unique codes/emails

### ✅ Database Migration

- **`006_create_guest_sessions.sql`**: Adds `session_id TEXT` column to `guests` table

### ✅ Edge Function

- **`create-guest`**: Updated to:
  - Accept multiple guests in one request
  - Generate or accept `session_id`
  - Hash each guest's access code individually
  - Send welcome email to each guest
  - Create room_cleaning_status record

## Next Steps

### 1. Run Database Migration

Execute the migration in your Supabase SQL Editor:

```bash
# Navigate to Supabase Dashboard > SQL Editor
# Run the file: database/migrations/006_create_guest_sessions.sql
```

Or run it via CLI:

```bash
supabase db push
```

### 2. Regenerate TypeScript Types

After running the migration, regenerate your database types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 3. Update Edge Function

Deploy the updated `create-guest` edge function:

```bash
supabase functions deploy create-guest
```

### 4. Test the Flow

1. **Create Guests**:

   - Open Guest Management page
   - Click "Add Guest"
   - Fill in room information
   - Add multiple guests (use "Add Another Guest" button)
   - Generate unique access codes for each guest
   - Submit the form

2. **Verify Database**:

   ```sql
   -- Check guests table
   SELECT id, session_id, room_number, guest_name
   FROM guests
   WHERE session_id = 'your-session-id';

   -- Check guest_personal_data
   SELECT gpd.*, g.session_id
   FROM guest_personal_data gpd
   JOIN guests g ON g.id = gpd.guest_id
   WHERE g.session_id = 'your-session-id';
   ```

3. **Test Guest Login**:
   - Use each guest's access code to log in
   - Verify they can access their own data
   - Confirm they share the same room/booking

## Data Flow

### Creating a Guest Session

```
Frontend Form
    ↓
validateGuestForm()
    ↓
createGuestSession()
    ↓
Edge Function (create-guest)
    ↓
├─> Generate session_id (crypto.randomUUID())
├─> For each guest:
│   ├─> Hash access code
│   ├─> Insert into guests table (with session_id)
│   ├─> Insert into guest_personal_data table
│   └─> Send welcome email
└─> Create room_cleaning_status (once)
    ↓
Return success with guest IDs
```

### Database Structure

**guests table**:

```sql
id (uuid)
session_id (text) -- Links all guests in same booking
hotel_id (uuid)
room_number (text)
hashed_verification_code (text) -- Each guest has unique code
guest_name (text)
access_code_expires_at (timestamp)
is_active (boolean)
dnd_status (boolean)
created_by (uuid)
created_at (timestamp)
```

**guest_personal_data table**:

```sql
id (uuid)
guest_id (uuid) -- References guests.id
first_name (text)
last_name (text)
guest_email (text)
phone_number (text)
date_of_birth (date)
country (text)
language (text)
created_at (timestamp)
```

## Key Features

### ✨ Session Management

- All guests in the same booking share a `session_id`
- Session ID is generated client-side using `crypto.randomUUID()`
- Ensures proper grouping of guests in the same room

### ✨ Individual Authentication

- Each guest gets their own 6-digit access code
- Codes are hashed using `hash_verification_code` RPC function
- Each guest can log in independently

### ✨ Form Validation

- Checks required fields for each guest
- Ensures access codes are unique within the session
- Validates email uniqueness
- Checks proper email format

### ✨ Email Notifications

- Welcome email sent to each guest individually
- Contains their unique access code
- Includes hotel name and room information

## Troubleshooting

### Issue: "Hotel ID not found"

- **Cause**: User's hotel_id is not available
- **Fix**: Check that `useCurrentUserHotelId()` hook is working and user is logged in

### Issue: Edge function fails

- **Cause**: Missing environment variables or RLS policies
- **Fix**:
  - Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are set
  - Check RLS policies allow staff to create guests
  - Ensure `hash_verification_code` RPC function exists

### Issue: Guests created but emails not sent

- **Cause**: Email service not configured or failed
- **Fix**:
  - Check `send-guest-credentials-email` edge function is deployed
  - Verify email service credentials
  - Edge function continues on email failure (safe fail)

## API Reference

### `createGuestSession(params)`

Creates a new guest session with multiple guests.

**Parameters**:

```typescript
{
  hotelId: string;
  formData: GuestFormData;
}
```

**Returns**:

```typescript
{
  success: boolean;
  sessionId: string;
  roomNumber: string;
  guestsCreated: number;
  guests: Array<{ id: string; name: string; email: string }>;
  emailResults: Array<{ guest: string; sent: boolean }>;
  roomCleaningCreated: boolean;
}
```

### `validateGuestForm(formData)`

Validates guest form data before submission.

**Parameters**:

```typescript
{
  roomNumber: string;
  checkoutDate: string;
  guests: GuestInfo[];
}
```

**Returns**:

```typescript
{
  isValid: boolean;
  errors: string[];
}
```

## Security Considerations

1. **Access Code Hashing**: All codes are hashed before storage using bcrypt
2. **RLS Policies**: Ensure proper Row Level Security is configured
3. **Service Role**: Edge function uses service role key for database operations
4. **Validation**: All inputs are validated before processing
5. **Unique Codes**: System ensures no duplicate codes within a session

## Future Enhancements

- [ ] Add guest session management UI (view all guests in a booking)
- [ ] Implement guest transfer between rooms
- [ ] Add guest checkout with session cleanup
- [ ] Create guest activity log per session
- [ ] Add family/group features (shared services, billing)
