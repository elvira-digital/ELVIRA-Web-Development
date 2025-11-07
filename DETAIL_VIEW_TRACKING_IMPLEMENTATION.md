# Detail View Duration Tracking Implementation

## Overview

Implemented comprehensive duration tracking for all guest detail views (bottom sheets/modals) to accurately measure how long guests spend viewing individual items.

## Problem Solved

Previously, item analytics showed "N/A" for time spent because only instant 'click' events were tracked without duration. Now we track how long detail views are open.

## Implementation Details

### 1. Created Reusable Hook: `useDetailViewTracking`

**Location:** `src/hooks/guest-analytics/useDetailViewTracking.ts`

**Purpose:** Measures time a detail view is open and tracks it to analytics

**How it works:**

- Uses `useRef` to store the timestamp when modal opens
- Uses `useEffect` with `isOpen` dependency to detect open/close
- On cleanup (when modal closes), calculates duration in seconds
- Only tracks if duration >= 1 second (prevents accidental opens)
- Calls `trackItemInteraction` with:
  - `actionType: 'detail_view'`
  - `durationSeconds: <calculated duration>`

**Parameters:**

```typescript
{
  isOpen: boolean;           // Modal open state
  guestId?: string;          // Guest identifier
  hotelId?: string;          // Hotel identifier
  sessionId?: string;        // Session identifier
  sectionType: string;       // Section type (amenities, shop, restaurant, etc.)
  itemId?: string;           // Item identifier
  itemName?: string;         // Item name
  itemCategory?: string;     // Item category
}
```

### 2. Updated All Detail Bottom Sheets

#### ProductDetailBottomSheet (Shop Items)

**Location:** `src/screens/guest/shared/modals/details/ProductDetailBottomSheet.tsx`

- **Section Type:** `'shop'`
- **Tracks:** Product detail view duration
- **Category:** Product category

#### AmenityDetailBottomSheet (Hotel Services)

**Location:** `src/screens/guest/shared/modals/details/AmenityDetailBottomSheet.tsx`

- **Section Type:** `'amenities'`
- **Tracks:** Amenity detail view duration
- **Category:** Amenity category

#### MenuItemDetailBottomSheet (Restaurant Items)

**Location:** `src/screens/guest/shared/modals/details/MenuItemDetailBottomSheet.tsx`

- **Section Type:** `'restaurant'`
- **Tracks:** Menu item detail view duration
- **Category:** Menu item category

#### PlaceDetailBottomSheet (Third-Party Places)

**Location:** `src/screens/guest/shared/modals/details/PlaceDetailBottomSheet.tsx`

- **Section Type:** Dynamic based on `place.type` (wellness/tours/gastronomy)
- **Tracks:** Place detail view duration
- **Category:** Place type

#### RecommendedPlaceBottomSheet (Places to Visit)

**Location:** `src/screens/guest/to-visit/components/RecommendedPlaceBottomSheet.tsx`

- **Section Type:** `'to-visit'`
- **Tracks:** Recommended place detail view duration
- **Category:** Place category

### 3. Changes Made to Each Component

**Imports Added:**

```typescript
import { useGuestAuth } from "../../../../../contexts/guest/GuestAuthContext";
import { useDetailViewTracking } from "../../../../../hooks/guest-analytics/useDetailViewTracking";
```

**Inside Component:**

```typescript
const { guestSession } = useGuestAuth();

useDetailViewTracking({
  isOpen,
  guestId: guestSession?.guestData?.id,
  hotelId: guestSession?.guestData?.hotel_id,
  sessionId: guestSession?.guestData?.id,
  sectionType: "<section-specific-type>",
  itemId: <item>?.id,
  itemName: <item>?.name,
  itemCategory: <item>?.category,
});
```

## Database Schema

Records are stored in `guest_analytics_interactions` table:

```sql
- id: UUID (primary key)
- guest_id: UUID (references guests)
- hotel_id: UUID (references hotels)
- session_id: UUID
- section_type: TEXT (amenities, shop, restaurant, wellness, tours, gastronomy, to-visit)
- action_type: TEXT ('detail_view')
- item_id: TEXT (item identifier)
- item_name: TEXT (item name)
- item_category: TEXT (item category)
- duration_seconds: INTEGER (how long modal was open)
- created_at: TIMESTAMP
```

## How It Works

1. **User Opens Detail Modal:**

   - Hook detects `isOpen = true`
   - Stores current timestamp in ref: `startTimeRef.current = Date.now()`

2. **User Views Content:**

   - User reads details, views photos, etc.
   - Timer is running silently

3. **User Closes Detail Modal:**

   - Hook detects `isOpen = false`
   - Cleanup function runs
   - Calculates: `durationSeconds = (Date.now() - startTimeRef.current) / 1000`
   - If duration >= 1 second, tracks to database

4. **Analytics Dashboard:**
   - `metricsService.calculatePopularItems` fetches interactions
   - Aggregates clicks, unique visitors, and average time spent
   - Displays in `GuestServiceUsage` component

## Testing

### Manual Testing Steps:

1. Login as guest on guest dashboard
2. Navigate to any section (Amenities, Shop, Restaurant, Wellness, Tours, Gastronomy, Places to Visit)
3. Click on any item to open detail view
4. Wait a few seconds (e.g., 5-10 seconds)
5. Close the detail view
6. Check browser console for tracking logs:
   - `⏱️ Started tracking detail view for: [item name]`
   - `⏱️ Finished tracking detail view: [item name] (duration: X.XX seconds)`

### Database Verification:

```sql
SELECT
  item_name,
  action_type,
  duration_seconds,
  section_type,
  created_at
FROM guest_analytics_interactions
WHERE action_type = 'detail_view'
ORDER BY created_at DESC
LIMIT 20;
```

### Analytics Dashboard Verification:

1. Navigate to Hotel Dashboard → Web Analytics
2. Click on any section card to expand
3. Verify items now show actual time values instead of "N/A"
4. Time should reflect aggregated durations from detail_view records

## Benefits

1. **Accurate Time Tracking:** Measures actual engagement time, not just clicks
2. **Granular Insights:** Know which items guests spend most time viewing
3. **Better Analytics:** Hotel staff can see which offerings generate most interest
4. **Engagement Metrics:** Understand guest behavior patterns for each category

## Future Enhancements

### Potential Improvements:

- Track scroll depth within detail views
- Track which sections of detail view are viewed (photos, description, etc.)
- Add heatmap tracking for user interactions
- Implement A/B testing based on view duration patterns
- Alert hotel staff when items have low engagement despite high clicks

## Notes

- Duration is only tracked if >= 1 second (prevents accidental taps)
- Uses `useRef` to avoid re-renders during tracking
- Cleanup function ensures tracking happens even if component unmounts
- Works with all authenticated guest sessions
- Compatible with existing analytics infrastructure
