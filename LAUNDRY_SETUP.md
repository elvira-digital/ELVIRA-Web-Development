# 🧺 Laundry Services - Database Setup Required

## Quick Setup (2 Steps)

### Step 1: Run SQL Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy and run: `database/migrations/008_create_laundry_services.sql`

### Step 2: Regenerate TypeScript Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Replace `YOUR_PROJECT_ID` with your project ID from Supabase Project Settings.

## That's it! 🎉

The Laundry section will now work with full CRUD operations.

For detailed instructions, see: `docs/LAUNDRY_SERVICES_SETUP.md`
