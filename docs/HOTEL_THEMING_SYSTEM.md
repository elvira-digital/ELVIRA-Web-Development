# Hotel Appearance Theming System - Complete Guide

## 🎨 Overview

Comprehensive theming system that connects all guest-facing components to the `hotel_appearance_settings` table with real-time updates.

---

## 📐 Architecture

### 1. **GuestThemeProvider** (Context)

**Location:** `src/contexts/guest/GuestThemeContext.tsx`

Wraps the entire guest application in `GuestRouter.tsx` and provides theme settings to all components.

```tsx
<GuestThemeProvider hotelId={guestData.hotel_id}>
  <GuestCartProvider>
    <GuestNotificationProvider>{/* App content */}</GuestNotificationProvider>
  </GuestCartProvider>
</GuestThemeProvider>
```

**Features:**

- ✅ Fetches hotel appearance settings from database
- ✅ Real-time subscription for live updates
- ✅ Automatic query invalidation when settings change
- ✅ Default fallback values
- ✅ Type-safe with TypeScript

### 2. **useGuestTheme** (Hook)

**Location:** `src/contexts/guest/useGuestTheme.ts`

Access theme settings in any component:

```typescript
import { useGuestTheme } from "../../../../contexts/guest";

const { theme, isLoading } = useGuestTheme();

// Access any theme property
const primaryColor = theme.color_primary;
const borderRadius = theme.border_radius;
```

### 3. **useHotelAppearance** (Data Hook)

**Location:** `src/hooks/guest/useHotelAppearance.ts`

Low-level hook for fetching appearance data (used internally by GuestThemeProvider).

---

## 🗄️ Database Schema

### Table: `hotel_appearance_settings`

#### **Colors**

| Column                 | Type   | Default   | Description                            |
| ---------------------- | ------ | --------- | -------------------------------------- |
| `color_primary`        | `text` | `#10b981` | Primary brand color (buttons, accents) |
| `color_text_primary`   | `text` | `#111827` | Main text color                        |
| `color_text_secondary` | `text` | `#6b7280` | Secondary/muted text                   |
| `color_text_inverse`   | `text` | `#ffffff` | Text on dark backgrounds               |

#### **Typography**

| Column                 | Type   | Default                        | Description     |
| ---------------------- | ------ | ------------------------------ | --------------- |
| `font_family`          | `text` | `Inter, system-ui, sans-serif` | Font family     |
| `font_size_base`       | `text` | `16px`                         | Base text size  |
| `font_size_heading`    | `text` | `24px`                         | Heading size    |
| `font_size_small`      | `text` | `14px`                         | Small text size |
| `font_weight_normal`   | `text` | `400`                          | Normal weight   |
| `font_weight_medium`   | `text` | `500`                          | Medium weight   |
| `font_weight_semibold` | `text` | `600`                          | Semibold weight |
| `font_weight_bold`     | `text` | `700`                          | Bold weight     |

#### **Layout**

| Column          | Type   | Default    | Description          |
| --------------- | ------ | ---------- | -------------------- |
| `border_radius` | `text` | `0.75rem`  | Border radius (12px) |
| `card_style`    | `text` | `elevated` | Card style variant   |
| `icon_size`     | `text` | `24px`     | Icon dimensions      |

#### **Component-Specific**

| Column                      | Type   | Default   | Description                 |
| --------------------------- | ------ | --------- | --------------------------- |
| `stay_card_gradient_from`   | `text` | `#3b82f6` | Stay card gradient start    |
| `stay_card_gradient_to`     | `text` | `#9333ea` | Stay card gradient end      |
| `about_us_background_color` | `text` | `#f3f4f6` | About Us section background |

---

## 🧩 Connected Components

### ✅ **Stay Details Card**

**Location:** `src/screens/guest/shared/cards/StayDetailsCard.tsx`

**Themed Properties:**

- Gradient background colors
- Border radius on card and inner boxes
- Font family, sizes, and weights for all text
- Icon size for eye icons
- Text inverse color for white text

**Example:**

```tsx
<div
  style={{
    background: `linear-gradient(to bottom right, ${theme.stay_card_gradient_from}, ${theme.stay_card_gradient_to})`,
    borderRadius: theme.border_radius,
  }}
>
```

---

### ✅ **About Us Section**

**Location:** `src/screens/guest/shared/about-us/AboutUsSection.tsx`

**Themed Properties:**

- Background color
- Primary color for "Us" text highlight
- Text inverse color for "About" text
- Font family, sizes, and weights
- Border radius for content box and button

**Example:**

```tsx
<section style={{ backgroundColor: theme.about_us_background_color }}>
  <h2 style={{ color: theme.color_text_inverse }}>
    About <span style={{ color: theme.color_primary }}>Us</span>
  </h2>
</section>
```

---

### ✅ **Category Cards**

**Location:** `src/screens/guest/shared/category-cards/CategoryCard.tsx`

**Themed Properties:**

- Primary color with 15% opacity for title background
- Text primary color for titles
- Text secondary color for descriptions
- Font family, sizes, and weights
- Border radius

**Example:**

```tsx
<div style={{
  backgroundColor: `${theme.color_primary}15`, // 15 = ~8% opacity hex
  borderRadius: theme.border_radius
}}>
```

---

### ✅ **Guest Button**

**Location:** `src/components/guest/shared/buttons/GuestButton.tsx`

**Themed Properties:**

- Primary color for primary variant
- Text secondary color for secondary variant
- Text inverse color for button text
- Font family, size, and weight
- Border radius

**Variants:**
| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `primary` | `color_primary` | `color_text_inverse` | None |
| `secondary` | `color_text_secondary` | `color_text_inverse` | None |
| `outline` | White | `color_primary` | `color_primary` |

**Example:**

```tsx
<GuestButton variant="primary">Book Now</GuestButton>
```

---

## 🔄 Real-time Updates

### How It Works:

1. **Subscription Setup:** GuestThemeProvider subscribes to `hotel_appearance_settings` table changes
2. **Change Detection:** When settings are updated in Supabase, real-time event fires
3. **Query Refetch:** Query automatically refetches with new data
4. **Re-render:** All components using `useGuestTheme` re-render with new values

### Console Logs:

```
🎨 Hotel appearance settings updated: {
  color_primary: "#10b981",
  stay_card_gradient_from: "#3b82f6",
  ...
}
```

---

## 🧪 Testing

### 1. Update All Theme Colors

```sql
UPDATE hotel_appearance_settings
SET
  color_primary = '#ec4899',              -- Pink primary
  stay_card_gradient_from = '#f97316',    -- Orange gradient start
  stay_card_gradient_to = '#ef4444',      -- Red gradient end
  about_us_background_color = '#1f2937'   -- Dark gray background
WHERE hotel_id = 'your-hotel-id';
```

### 2. Update Typography

```sql
UPDATE hotel_appearance_settings
SET
  font_family = 'Poppins, sans-serif',
  font_size_heading = '28px',
  border_radius = '1.5rem'  -- More rounded
WHERE hotel_id = 'your-hotel-id';
```

### 3. Verify Real-time Updates

1. Open guest app
2. Run SQL update in Supabase
3. Watch console for: `🎨 Hotel appearance settings updated:`
4. See components update immediately without refresh!

---

## 📋 RLS Policies Required

```sql
-- Allow guests to read their hotel's appearance settings
CREATE POLICY "Guests can read their hotel appearance settings"
ON hotel_appearance_settings
FOR SELECT
TO authenticated
USING (
  hotel_id = ((auth.jwt() ->> 'hotel_id'::text))::uuid
);

-- Enable real-time
ALTER TABLE hotel_appearance_settings REPLICA IDENTITY FULL;
```

---

## 🎯 Benefits

✅ **Dynamic Branding** - Each hotel can customize their guest app appearance  
✅ **Real-time Updates** - Changes apply instantly without app restart  
✅ **Consistent Design** - All components use the same theme values  
✅ **Type-safe** - Full TypeScript support with database types  
✅ **Performance** - Uses React Query caching and efficient subscriptions  
✅ **Fallback Defaults** - App works even without custom settings

---

## 🚀 Future Enhancements

Potential additions to the theming system:

- Custom animations and transitions
- Dark mode toggle
- Multiple color palettes per hotel
- Component-specific overrides
- Advanced card styling options
- Custom icon packs
