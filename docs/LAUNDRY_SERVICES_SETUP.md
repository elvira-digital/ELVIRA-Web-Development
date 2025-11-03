# Laundry Services Setup Guide

This guide explains how to set up the laundry services feature in your database.

## 1. Run the Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

**File:** `database/migrations/008_create_laundry_services.sql`

This will create:

- ✅ `laundry_services` table with proper schema
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Updated_at trigger

### Steps:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open `database/migrations/008_create_laundry_services.sql`
4. Copy and paste the entire SQL content
5. Click **Run** to execute

## 2. Regenerate TypeScript Types

After running the migration, you need to regenerate the TypeScript database types so the application recognizes the new `laundry_services` table.

### Option A: Using Supabase CLI (Recommended)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (found in Project Settings).

### Option B: Manual Type Generation

1. Go to Supabase Dashboard → **Project Settings** → **API**
2. Find your project reference ID
3. Run the command above with your project ID

### Option C: Using the docs/REGENERATE_TYPES.md guide

Follow the instructions in `docs/REGENERATE_TYPES.md` if it exists in your project.

## 3. Verify the Setup

After running the migration and regenerating types:

1. **Check the table exists:**

   - Go to Supabase Dashboard → **Table Editor**
   - You should see `laundry_services` table

2. **Test in the app:**
   - Go to Hotel Dashboard → **Laundry** section
   - Click **Add Service** button
   - Create a test laundry service
   - Verify it appears in the table

## 4. Table Schema

The `laundry_services` table includes:

| Column        | Type          | Description                               |
| ------------- | ------------- | ----------------------------------------- |
| `id`          | UUID          | Primary key                               |
| `hotel_id`    | UUID          | Foreign key to hotels table               |
| `category`    | TEXT          | Service category (e.g., "Shirt", "Pants") |
| `description` | TEXT          | Optional service description              |
| `price`       | NUMERIC(10,2) | Service price                             |
| `is_active`   | BOOLEAN       | Active/Inactive status                    |
| `created_at`  | TIMESTAMPTZ   | Creation timestamp                        |
| `updated_at`  | TIMESTAMPTZ   | Last update timestamp                     |
| `created_by`  | UUID          | User who created the service              |

## 5. RLS Policies

The following security policies are automatically applied:

- ✅ Hotel staff can view their hotel's services
- ✅ Hotel staff can create services for their hotel
- ✅ Hotel staff can update their hotel's services
- ✅ Hotel staff can delete their hotel's services
- ❌ Staff cannot access other hotels' services

## Troubleshooting

### Error: "Property 'laundry_services' does not exist"

- **Solution:** You need to regenerate the TypeScript types (Step 2)

### Error: "relation 'laundry_services' does not exist"

- **Solution:** Run the database migration (Step 1)

### Services not showing up

- **Check:** RLS policies are enabled
- **Check:** You're logged in with a user associated with a hotel
- **Check:** The hotel_id is correctly set

## Features Implemented

✅ Full CRUD operations for laundry services
✅ Create, Read, Update, Delete services
✅ Active/Inactive status toggle
✅ Search and filter services
✅ Sortable table columns
✅ Form validation
✅ Confirmation modals
✅ Real-time updates via React Query
✅ Row Level Security for multi-tenant isolation

## Next Steps

After setup is complete, you can:

1. Add laundry services for your hotel
2. Create laundry orders (Orders tab - coming soon)
3. Manage service pricing
4. Toggle service availability
