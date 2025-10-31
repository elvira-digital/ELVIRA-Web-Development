# Stay Card Hotel Appearance Integration

## Overview

The Stay Details Card in the guest home screen is now connected to the `hotel_appearance_settings` table with real-time updates.

## Implementation

### 1. Database Table: `hotel_appearance_settings`

The table contains gradient color settings:

- `stay_card_gradient_from`: Starting color of the gradient (e.g., "#3b82f6")
- `stay_card_gradient_to`: Ending color of the gradient (e.g., "#9333ea")

### 2. Hook: `useHotelAppearance`

Location: `src/hooks/guest/useHotelAppearance.ts`

**Features:**

- ✅ Fetches hotel appearance settings from database
- ✅ Real-time subscription for live updates
- ✅ Automatic query invalidation when settings change
- ✅ Console logging for debugging

**Usage:**

```typescript
const { data: appearanceSettings } = useHotelAppearance(hotelId);
```

### 3. Component: `StayDetailsCard`

Location: `src/screens/guest/shared/cards/StayDetailsCard.tsx`

**New Props:**

```typescript
interface StayDetailsCardProps {
  // ... existing props
  gradientFrom?: string; // Default: "#3b82f6"
  gradientTo?: string; // Default: "#9333ea"
}
```

The card now uses inline styles to apply the gradient:

```tsx
<div
  style={{
    background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
  }}
>
```

### 4. Integration: `GuestHome`

Location: `src/screens/guest/home/GuestHome.tsx`

**Implementation:**

```typescript
// Fetch appearance settings
const { data: appearanceSettings } = useHotelAppearance(hotelId);

// Pass to card
<StayDetailsCard
  // ... other props
  gradientFrom={appearanceSettings?.stay_card_gradient_from}
  gradientTo={appearanceSettings?.stay_card_gradient_to}
/>;
```

## Real-time Updates

### How It Works:

1. Hook subscribes to changes in `hotel_appearance_settings` table
2. When settings are updated in Supabase, the subscription triggers
3. Query is automatically refetched with new data
4. Component re-renders with new gradient colors

### Console Logs:

You'll see this message when settings update:

```
🎨 Hotel appearance settings updated: { stay_card_gradient_from: "...", ... }
```

## Testing

### Update Gradient Colors:

1. Go to Supabase SQL Editor
2. Run query to update colors:

```sql
UPDATE hotel_appearance_settings
SET
  stay_card_gradient_from = '#10b981',  -- emerald-500
  stay_card_gradient_to = '#059669'      -- emerald-600
WHERE hotel_id = 'your-hotel-id';
```

3. Card should update immediately without page refresh!

### Default Colors:

If no settings are found, the card uses default colors:

- From: `#3b82f6` (blue-500)
- To: `#9333ea` (purple-600)

## Database Requirements

### RLS Policies:

Ensure guests can read `hotel_appearance_settings`:

```sql
CREATE POLICY "Guests can read their hotel appearance settings"
ON hotel_appearance_settings
FOR SELECT
TO authenticated
USING (
  hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid
);
```

### Real-time Enabled:

Real-time must be enabled for the table in Supabase dashboard:

1. Go to Database > Replication
2. Enable replication for `hotel_appearance_settings`

## Benefits

✅ **Dynamic branding** - Each hotel can customize their stay card colors
✅ **Real-time updates** - Changes apply instantly without app restart
✅ **Fallback defaults** - Card works even without custom settings
✅ **Type-safe** - Full TypeScript support with database types
✅ **Performance** - Uses React Query caching and efficient subscriptions

## Future Enhancements

Potential additions:

- Font family customization
- Border radius settings
- Text color overrides
- Animation preferences
