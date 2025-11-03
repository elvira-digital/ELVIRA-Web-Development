# Guest Creation Debug Guide

## Error: 401 Unauthorized

### Possible Causes

1. **No active session**

   - User is not logged in
   - Session has expired
   - Solution: Check `supabase.auth.getSession()`

2. **Edge function not getting JWT**

   - Authorization header not being passed
   - Solution: Verify `supabase.functions.invoke()` auto-includes auth

3. **Service role key missing**
   - Edge function can't create admin client
   - Solution: Check Supabase dashboard > Edge Functions > Secrets

### Debug Steps

#### 1. Check if user is logged in (Frontend)

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session);
console.log("User:", session?.user);
console.log("Access token:", session?.access_token);
```

#### 2. Test edge function manually (Supabase Dashboard)

Go to: Supabase Dashboard > Edge Functions > create-guest > Invoke

Test payload:

```json
{
  "hotelId": "your-hotel-uuid",
  "sessionId": "test-session-123",
  "roomNumber": "101",
  "checkoutDate": "2025-11-15T12:00:00Z",
  "guests": [
    {
      "verificationCode": "123456",
      "firstName": "Test",
      "lastName": "Guest",
      "email": "test@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1990-01-01",
      "country": "US",
      "language": "en"
    }
  ]
}
```

#### 3. Check Edge Function Secrets

Required environment variables:

- `SUPABASE_URL` ✓ (automatically set)
- `SUPABASE_ANON_KEY` ✓ (automatically set)
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CHECK THIS!**

To set service role key:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 4. Check Edge Function Logs

```bash
supabase functions logs create-guest --tail
```

Or in Supabase Dashboard > Edge Functions > create-guest > Logs

### Most Likely Fix

The `SUPABASE_SERVICE_ROLE_KEY` is probably not set in the edge function secrets!

#### Solution:

1. Go to Supabase Dashboard
2. Settings > API
3. Copy the `service_role` key (not anon key!)
4. Go to Edge Functions
5. Click on your project settings
6. Add secret: `SUPABASE_SERVICE_ROLE_KEY` = `<your-service-role-key>`

Or via CLI:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-actual-key
```

Then redeploy:

```bash
supabase functions deploy create-guest
```

### Alternative: Check RLS Policies

If service role key is set, check if RLS policies are blocking:

- `guests` table: SELECT, INSERT policies for authenticated users
- `guest_personal_data` table: SELECT, INSERT policies for authenticated users
- `room_cleaning_status` table: INSERT policy for authenticated users

The edge function uses the service role key which bypasses RLS, but if the initial auth check fails, it could be an RLS issue on the `hotel_staff` table when verifying the user.
