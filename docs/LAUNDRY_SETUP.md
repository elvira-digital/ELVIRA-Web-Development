# Laundry Feature - Complete Setup Guide

## Overview

This document outlines the complete laundry feature implementation for both hotel staff and guests.

## Features Implemented

### 1. Hotel Dashboard - Laundry Management

**Location**: `src/screens/hotel/hotel-laundry/`

**Components**:

- `HotelLaundry.tsx` - Main page with tabs (Services, Orders) and search
- `services/Services.tsx` - Service management interface
- `services/ServicesTable.tsx` - Data table with sorting and actions
- `services/ServiceModal.tsx` - Create/Edit service form

**Features**:

- ✅ Create, edit, delete, and view laundry services
- ✅ Service categories (Wash & Fold, Dry Cleaning, Pressing, etc.)
- ✅ Price management
- ✅ Active/Inactive status toggle
- ✅ Search and filter functionality
- ✅ Tabs layout for Services and Orders (Orders pending implementation)

### 2. Guest Dashboard - Laundry Services

**Location**: `src/screens/guest/laundry/`

**Components**:

- `GuestLaundry.tsx` - Main guest laundry page
- `GuestLaundryHeader.tsx` - Header with search and back button

**Features**:

- ✅ View available laundry services
- ✅ Search functionality
- ✅ Consistent UI with other guest pages
- ✅ Integration with guest navigation system

### 3. Database Structure

**Migration**: `database/migrations/008_create_laundry_services.sql`

**Table**: `laundry_services`

```sql
- id (uuid, primary key)
- hotel_id (uuid, references hotels)
- category (text)
- description (text)
- price (numeric)
- is_active (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
- created_by (uuid, references profiles)
- updated_at_by (uuid, references profiles)
```

**Security**: Row Level Security (RLS) policies implemented
**Indexes**: Optimized for hotel_id and is_active queries
**Triggers**: Auto-update timestamps

### 4. React Query Hooks

**Location**: `src/hooks/laundry/`

**Hooks**:

- `useLaundryServices()` - Fetch all services for a hotel
- `useCreateLaundryService()` - Create new service
- `useUpdateLaundryService()` - Update existing service
- `useDeleteLaundryService()` - Delete service
- `useUpdateLaundryServiceStatus()` - Toggle active status

All hooks include:

- ✅ Error handling
- ✅ Loading states
- ✅ Automatic cache invalidation
- ✅ TypeScript support

### 5. Navigation & Routing

**Hotel Side**:

- Sidebar menu item with t-shirt icon
- Control panel toggle to show/hide in settings
- Mapped to `hotel_laundry` setting key

**Guest Side**:

- Hotel category card on home page
- Direct navigation to `/guest/laundry`
- Integrated with GuestRouter

## Setup Instructions

### Step 1: Run Database Migration

Execute the SQL migration in your Supabase project:

```bash
# Option 1: Via Supabase CLI
supabase db push database/migrations/008_create_laundry_services.sql

# Option 2: Via Supabase Dashboard
# Copy and paste the contents of 008_create_laundry_services.sql
# into the SQL Editor and run it
```

### Step 2: Regenerate TypeScript Types

After running the migration, regenerate database types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### Step 3: Enable Laundry in Hotel Settings

1. Log in as hotel admin
2. Navigate to Settings → Control Panel
3. Toggle "Laundry" to enable it
4. The "Laundry" menu item will appear in the sidebar

### Step 4: Add Initial Services

1. Go to Laundry → Services tab
2. Click "Add Service"
3. Fill in:
   - Category (Wash & Fold, Dry Cleaning, Pressing, etc.)
   - Description
   - Price
   - Active status
4. Click "Add Service"

## Guest Experience Flow

1. Guest logs into their dashboard
2. Sees "Laundry" card in Hotel category section
3. Clicks card → navigates to laundry services page
4. Can search and browse available services
5. (Future: Add to cart and place order)

## Hotel Staff Management Flow

1. Staff logs into hotel dashboard
2. Clicks "Laundry" in sidebar menu
3. Manages services:
   - View all services in table
   - Search/filter services
   - Add new service via modal
   - Edit service details
   - Toggle active/inactive status
   - Delete services with confirmation
4. (Future: View and manage orders in Orders tab)

## Settings Configuration

### Hotel Settings Table

The feature uses the `hotel_settings` table with:

- `setting_key`: `hotel_laundry`
- `setting_value`: `true` (enabled) / `false` (disabled)

### Menu Filtering

The `useFilteredMenuItems` hook automatically:

- Shows/hides "Laundry" menu item based on `hotel_laundry` setting
- Applies to sidebar navigation
- Independent per hotel (multi-tenant support)

## File Structure

```
src/
├── screens/
│   ├── hotel/
│   │   └── hotel-laundry/
│   │       ├── HotelLaundry.tsx
│   │       ├── index.ts
│   │       └── services/
│   │           ├── Services.tsx
│   │           ├── ServicesTable.tsx
│   │           └── ServiceModal.tsx
│   └── guest/
│       └── laundry/
│           ├── GuestLaundry.tsx
│           ├── GuestLaundryHeader.tsx
│           └── index.ts
├── hooks/
│   └── laundry/
│       └── useLaundryServices.ts
└── types/
    └── database.ts (auto-generated, includes laundry_services)

database/
└── migrations/
    └── 008_create_laundry_services.sql
```

## Icons Used

- **Menu/Sidebar**: `Shirt` icon from lucide-react (t-shirt outline)
- **Category Card**: `Shirt` icon from lucide-react

## Future Enhancements

### Planned Features:

1. **Guest Orders**:

   - Add to cart functionality
   - Place laundry orders
   - Order tracking
   - Order history

2. **Hotel Order Management**:

   - Orders tab implementation
   - Status updates (Received, In Progress, Ready, Delivered)
   - Order notifications
   - Order analytics

3. **Pricing & Packages**:

   - Bulk pricing
   - Service packages
   - Special offers

4. **Integration**:
   - Payment processing
   - Email/SMS notifications
   - Room delivery coordination

## Troubleshooting

### Types Not Found

**Issue**: TypeScript errors about `laundry_services` table
**Solution**: Run the type regeneration command (Step 2)

### Menu Item Not Showing

**Issue**: Laundry doesn't appear in sidebar
**Solution**:

1. Check if `hotel_laundry` setting exists in database
2. Verify setting value is `true`
3. Check user permissions

### RLS Policy Errors

**Issue**: Permission denied when accessing laundry services
**Solution**:

1. Verify RLS policies are enabled
2. Check user has valid hotel_id
3. Ensure user is authenticated

## Testing Checklist

### Hotel Staff Testing:

- [ ] Can create new laundry service
- [ ] Can edit existing service
- [ ] Can delete service (with confirmation)
- [ ] Can toggle service active status
- [ ] Search filters services correctly
- [ ] Services table sorts properly
- [ ] Modal validation works
- [ ] Setting toggle shows/hides menu item

### Guest Testing:

- [ ] Laundry card appears on home page
- [ ] Clicking card navigates to laundry page
- [ ] Services load and display correctly
- [ ] Search functionality works
- [ ] Back button returns to home
- [ ] Only active services are shown

### Multi-tenant Testing:

- [ ] Different hotels see only their services
- [ ] Settings are hotel-specific
- [ ] RLS prevents cross-hotel access

## Support

For issues or questions:

1. Check the troubleshooting section
2. Verify database migration ran successfully
3. Ensure types are regenerated
4. Check browser console for errors
5. Verify Supabase connection settings

---

**Last Updated**: Created during feature implementation
**Version**: 1.0.0
