# Guest Dashboard Analytics Setup

## Overview

This system tracks **real guest behavior** on the hotel dashboard, focusing on:

- Time spent in each section
- Clicks on specific items (amenities, menu items, products, etc.)
- Popular items per hotel

## Database Setup Required

### Step 1: Run the SQL Migration

Execute this file in your Supabase SQL Editor:

```
database/guest_analytics_tracking.sql
```

This creates two tables:

1. `guest_analytics_interactions` - Tracks clicks/views on specific items
2. `guest_section_sessions` - Tracks time spent in each dashboard section

### Step 2: What Gets Tracked

**For Each Hotel:**

- **Amenities**: Which amenity guests click on most (Pool Towels, Room Service, etc.)
- **Restaurant**: Most viewed menu items
- **Shop**: Most viewed/purchased products
- **Laundry**: Most requested laundry services
- **Tours/Wellness/Gastronomy**: Most popular experiences

## How It Works

### Current State

- ✅ Database schema created (`guest_analytics_tracking.sql`)
- ✅ TypeScript types defined
- ✅ Service functions ready (`metricsService.ts`)
- ✅ UI components ready
- ❌ Database tables not created yet
- ❌ Tracking not implemented in guest components

### What Needs To Be Done

1. **Run the SQL script** to create database tables
2. **Add tracking calls** in guest dashboard components (when guests click items)
3. **Test**: Use guest dashboard, click on items, see data in analytics

### Files Created

```
database/guest_analytics_tracking.sql         # Database schema
src/types/guest-analytics/                     # TypeScript types
src/services/guest-analytics/metricsService.ts # Data fetching
src/hooks/guest-analytics/useGuestMetrics.ts  # React hook
src/components/guest-analytics/               # UI components
src/screens/elvira/overview/web-analytics/    # Analytics dashboard
```

## Next Steps

1. **Execute SQL**: Run `guest_analytics_tracking.sql` in Supabase
2. **Verify tables**: Check that tables were created successfully
3. **Start tracking**: I'll help implement tracking calls in guest components
4. **View analytics**: Analytics will show real data as guests use the dashboard

## Simple Example

When a guest clicks on "Pool Towels" amenity:

```typescript
trackGuestInteraction({
  guestId: "guest-123",
  hotelId: "hotel-abc",
  sessionId: "session-xyz",
  sectionType: "amenities",
  itemId: "amenity-pool-towels",
  itemName: "Pool Towels",
  itemCategory: "pool",
  actionType: "click",
  timestamp: new Date(),
});
```

This data then appears in the Analytics Dashboard showing which items guests interact with most.
