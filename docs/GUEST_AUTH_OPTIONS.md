# Guest Session Authentication Flow

## The Question: Same Code vs Different Codes?

You have **two options** for how guests use verification codes:

---

## **Option 1: SAME Code, Select Identity** ⭐ RECOMMENDED

### Setup:

- All guests in same booking share **ONE verification code**: `"123456"`
- All have same `session_id` in database
- **All have same `hashed_verification_code`**

### Database Example:

```
Guest 1 (Dad):   session_id="abc", hashed_code=hash("123456")
Guest 2 (Mom):   session_id="abc", hashed_code=hash("123456")  ← SAME
Guest 3 (Son):   session_id="abc", hashed_code=hash("123456")  ← SAME
Guest 4 (Daughter): session_id="abc", hashed_code=hash("123456")  ← SAME
```

### Login Flow:

```
1. Guest enters code: "123456"
2. System finds 4 guests with this code
3. App shows: "Who are you?"
   [👤 John Smith]
   [👤 Jane Smith]
   [👤 Tommy Smith]
   [👤 Sarah Smith]
4. Guest selects their name
5. App remembers on this device → personalized experience
```

### Pros:

- ✅ Easy to share - Only one code to remember
- ✅ Convenient - Family can share code verbally
- ✅ Still personalized - Each person picks their profile
- ✅ Flexible - Anyone can use any device

### Cons:

- ❌ Less secure - Anyone with code can see all names
- ❌ Extra step - Must select identity after entering code

---

## **Option 2: DIFFERENT Codes, Direct Login**

### Setup:

- Each guest gets **unique verification code**
- All have same `session_id` (linked together)
- **Each has different `hashed_verification_code`**

### Database Example:

```
Guest 1 (Dad):   session_id="abc", hashed_code=hash("123456")
Guest 2 (Mom):   session_id="abc", hashed_code=hash("789012")  ← DIFFERENT
Guest 3 (Son):   session_id="abc", hashed_code=hash("345678")  ← DIFFERENT
Guest 4 (Daughter): session_id="abc", hashed_code=hash("901234")  ← DIFFERENT
```

### Login Flow:

```
1. Dad enters his code: "123456"
2. System finds 1 guest → John Smith
3. Automatically logged in as John
4. Personalized experience immediately
```

### Pros:

- ✅ More secure - Individual accountability
- ✅ Direct login - Code = identity
- ✅ No selection needed - Automatic personalization

### Cons:

- ❌ Must distribute 4 different codes
- ❌ Harder to share - Each person must remember their own
- ❌ Less convenient - Can't help each other login

---

## **My Recommendation: Hybrid Approach**

**Support BOTH options** in your system:

### Implementation:

```typescript
// When creating booking:
1. Generate ONE session_id for the group
2. Ask hotel staff: "Use same code for all guests?"

   If YES:
   - Generate one 6-digit code
   - Apply to all guests (same hashed_verification_code)

   If NO:
   - Generate unique code for each guest
   - Each gets different hashed_verification_code
```

### Login Logic:

```typescript
// Guest enters code
const guests = findGuestsByCode(code);

if (guests.length === 1) {
  // Only one guest → Direct login
  loginAs(guests[0]);
} else {
  // Multiple guests → Show selection
  showGuestPicker(guests);
}
```

---

## **Recommended for Hotels:**

For **families/leisure**: Use **SAME code** (more convenient)
For **business/corporate**: Use **DIFFERENT codes** (more secure, professional)

You could even let the hotel choose per booking!

---

## **To Implement Option 1 (Same Code):**

### In your AddGuestModal:

```typescript
const handleAddGuest = async (data: GuestFormData) => {
  const sessionId = crypto.randomUUID();
  const sharedCode = data.accessCode; // ONE code for all

  for (const guest of data.guests) {
    // 1. Create guest
    const { data: guestRecord } = await supabase
      .from("guests")
      .insert({
        hotel_id: hotelId,
        session_id: sessionId, // SAME
        room_number: data.roomNumber,
        access_code_expire_at: data.checkoutDate,
      })
      .select()
      .single();

    // 2. Hash THE SAME CODE for all guests
    await supabase.rpc("hash_verification_code", {
      guest_id: guestRecord.id,
      code: sharedCode, // ← SAME CODE
    });

    // 3. Create personal data
    await supabase.from("guest_personal_data").insert({
      guest_id: guestRecord.id,
      first_name: guest.firstName,
      last_name: guest.lastName,
      // ...
    });
  }
};
```

### UI Changes Needed:

1. **AddGuestModal**: Only show ONE access code field (not per guest)
2. **GuestLogin**: Add "Who are you?" selection screen after code entry
3. **Dashboard**: Show current guest's name prominently

---

## Which Should You Choose?

**I recommend Option 1 (Same Code)** because:

- Hotels typically deal with families/groups who want convenience
- Extra selection step is minor compared to managing multiple codes
- Still get personalization
- Can always add Option 2 later if needed

**Database structure supports both!** Just use the same or different codes when hashing.
