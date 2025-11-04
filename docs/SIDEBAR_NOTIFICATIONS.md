# Sidebar Notification System

## Overview

The sidebar notification system displays real-time pending counts for various hotel operations. Notification badges appear on menu items when there are pending actions that require staff attention.

## Features

### Notification Types

The system tracks pending items for the following categories:

1. **Chat Management** (`chat-management`)

   - Unread guest messages (`guest_messages` with `read_by_staff = false`)
   - Unread staff messages (`staff_messages` with `is_read = false`)

2. **Amenities** (`amenities`)

   - Pending amenity requests (`amenity_requests` with `status = 'pending'`)

3. **Restaurant** (`hotel-restaurant`)

   - Pending restaurant orders (`restaurant_orders` with `status = 'pending'`)

4. **Shop** (`hotel-shop`)

   - Pending shop orders (`shop_orders` with `status = 'pending'`)

5. **Laundry** (`hotel-laundry`)
   - Pending laundry orders (`laundry_orders` with `status = 'pending'`)

### Real-time Updates

The notification system uses Supabase real-time subscriptions to automatically update counts when:

- New messages are received
- New orders are placed
- Order statuses change
- Messages are marked as read

## File Structure

```
src/
├── hooks/
│   └── notifications/
│       ├── index.ts                        # Exports for notification hooks
│       └── usePendingNotifications.ts      # Hook to fetch pending counts
├── components/
│   ├── notifications/
│   │   ├── index.ts                        # Exports for notification components
│   │   └── NotificationBadge.tsx           # Badge component
│   ├── Sidebar.tsx                         # Updated with notification support
│   └── Layout.tsx                          # Updated to pass notifications
└── screens/
    └── hotel/
        └── HotelDashboard.tsx              # Integrates notifications
```

## Implementation Details

### 1. usePendingNotifications Hook

**Location:** `src/hooks/notifications/usePendingNotifications.ts`

Fetches pending notification counts for all tracked categories:

```typescript
interface PendingNotifications {
  chatManagement: number;
  amenities: number;
  restaurant: number;
  shop: number;
  laundry: number;
  total: number;
}

const { data: pendingNotifications } = usePendingNotifications(hotelId);
```

**Features:**

- Fetches counts from multiple tables in parallel
- Real-time subscriptions for automatic updates
- Optimized queries using `count` with `head: true`
- Auto-refetch every 60 seconds as fallback

### 2. NotificationBadge Component

**Location:** `src/components/notifications/NotificationBadge.tsx`

Displays a notification count badge:

```tsx
<NotificationBadge count={5} isCollapsed={false} />
```

**Features:**

- Red badge with white text
- Displays "99+" for counts over 99
- Adapts size for collapsed sidebar
- Automatically hidden when count is 0

### 3. Sidebar Integration

**Location:** `src/components/Sidebar.tsx`

Updated to accept and display notification counts:

```typescript
interface MenuItemNotifications {
  [menuItemId: string]: number;
}

<Sidebar
  notifications={{
    "chat-management": 5,
    amenities: 2,
    "hotel-restaurant": 3,
  }}
/>;
```

**Features:**

- Badges positioned at the right side of menu items
- Maintains consistent styling with sidebar theme
- Works in both expanded and collapsed states

### 4. HotelDashboard Integration

**Location:** `src/screens/hotel/HotelDashboard.tsx`

Maps notification data to menu item IDs:

```typescript
const menuNotifications: MenuItemNotifications = useMemo(() => {
  if (!pendingNotifications) return {};

  return {
    "chat-management": pendingNotifications.chatManagement || 0,
    amenities: pendingNotifications.amenities || 0,
    "hotel-restaurant": pendingNotifications.restaurant || 0,
    "hotel-shop": pendingNotifications.shop || 0,
    "hotel-laundry": pendingNotifications.laundry || 0,
  };
}, [pendingNotifications]);
```

## Database Queries

The hook performs the following queries:

### Guest Messages

```sql
SELECT COUNT(*) FROM guest_messages
WHERE hotel_id = ?
  AND sender_type = 'guest'
  AND read_by_staff = false
```

### Staff Messages

```sql
SELECT COUNT(*) FROM staff_messages
WHERE hotel_id = ?
  AND is_read = false
```

### Amenity Requests

```sql
SELECT COUNT(*) FROM amenity_requests
WHERE hotel_id = ?
  AND status = 'pending'
```

### Restaurant Orders

```sql
SELECT COUNT(*) FROM restaurant_orders
WHERE hotel_id = ?
  AND status = 'pending'
```

### Shop Orders

```sql
SELECT COUNT(*) FROM shop_orders
WHERE hotel_id = ?
  AND status = 'pending'
```

### Laundry Orders

```sql
SELECT COUNT(*) FROM laundry_orders
WHERE hotel_id = ?
  AND status = 'pending'
```

## Real-time Subscriptions

The system subscribes to changes on these tables:

- `guest_messages`
- `staff_messages`
- `amenity_requests`
- `restaurant_orders`
- `shop_orders`
- `laundry_orders`

When any record changes in these tables (INSERT, UPDATE, DELETE), the notification counts are automatically refreshed.

## Performance Considerations

1. **Optimized Queries**

   - Uses `count: "exact", head: true` for count-only queries
   - No unnecessary data fetching
   - Filters applied at database level

2. **Caching**

   - React Query caching with 30-second stale time
   - 1-minute garbage collection time
   - Prevents excessive re-fetches

3. **Real-time Efficiency**
   - Filters subscriptions by `hotel_id`
   - Only relevant updates trigger refetch
   - Debounced updates to prevent rapid re-renders

## Usage Example

### Basic Usage

```typescript
// In any component that needs notification counts
import { usePendingNotifications } from "../../hooks/notifications";

function MyComponent() {
  const hotelId = useHotelId();
  const { data: notifications, isLoading } = usePendingNotifications(hotelId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Pending messages: {notifications?.chatManagement}</p>
      <p>Pending orders: {notifications?.restaurant}</p>
      <p>Total pending: {notifications?.total}</p>
    </div>
  );
}
```

### Custom Badge

```typescript
import { NotificationBadge } from "../../components/notifications";

function CustomMenu() {
  return (
    <div className="menu-item">
      <span>Orders</span>
      <NotificationBadge count={12} />
    </div>
  );
}
```

## Styling

The notification badge uses:

- **Background:** Red (#ef4444)
- **Text:** White
- **Font Size:** 0.7rem
- **Border Radius:** 10px
- **Shadow:** 0 2px 4px rgba(0, 0, 0, 0.15)

## Future Enhancements

Potential improvements:

1. **Sound Notifications**

   - Play sound when new pending items arrive
   - Configurable in user settings

2. **Priority Levels**

   - Different badge colors for urgency
   - High priority orders highlighted

3. **Click-to-Navigate**

   - Click badge to jump to pending items
   - Filter view to show only pending

4. **Historical Tracking**

   - Track notification response times
   - Analytics on pending item patterns

5. **Push Notifications**
   - Browser push notifications
   - Email alerts for critical pending items

## Troubleshooting

### Notifications Not Updating

1. Check real-time subscriptions are enabled in Supabase
2. Verify RLS policies allow reading counts
3. Check browser console for WebSocket errors
4. Ensure `hotel_id` is correctly passed

### Incorrect Counts

1. Verify database status values match expected values
2. Check filters in usePendingNotifications hook
3. Verify RLS policies don't filter out records
4. Check for multiple active real-time connections

### Performance Issues

1. Check query execution time in Supabase logs
2. Add indexes on frequently filtered columns
3. Reduce real-time subscription frequency
4. Increase stale time if updates aren't critical

## Related Documentation

- [Chat Management](./GUEST_CHAT_FIXES.md)
- [Laundry Setup](./LAUNDRY_SETUP.md)
- [Restaurant Orders](./RESTAURANT_ORDERS_INTEGRATION.md)
- [Real-time Setup](./REALTIME_SETUP.md)
