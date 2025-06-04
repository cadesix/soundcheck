# Supabase Migration Management Guide

## Overview

This guide covers how to manage database migrations for the SoundCheck project using Supabase CLI.

## Current Migration Status

Your project is now properly synced with the following migration history:

```
Migration File                                    | Status    | Applied Date
--------------------------------------------------|-----------|------------------
20250527110818_remote_migration_1.sql           | ✅ Synced | 2025-05-27 11:08:18
20250527111212_remote_migration_2.sql           | ✅ Synced | 2025-05-27 11:12:12
20250528041507_remote_migration_3.sql           | ✅ Synced | 2025-05-28 04:15:07
20250529000001_create_creator_views_function.sql | ✅ Applied| 2025-05-29 00:00:01
```

## Migration Workflow

### 1. Check Current Status

```bash
# Check migration status
supabase migration list

# Check what's different between local and remote
supabase db diff
```

### 2. Create New Migration

```bash
# Generate timestamp for new migration
date +%Y%m%d%H%M%S

# Create new migration file
touch supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

### 3. Write Migration SQL

Example migration file:

```sql
-- supabase/migrations/20250529120000_add_analytics_functions.sql

-- Add a new function
CREATE OR REPLACE FUNCTION get_creator_analytics(creator_id UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_likes BIGINT,
  video_count BIGINT,
  avg_views_per_video NUMERIC
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    COALESCE(SUM(num_views), 0) as total_views,
    COALESCE(SUM(num_likes), 0) as total_likes,
    COUNT(*) as video_count,
    CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(AVG(num_views), 0)
      ELSE 0
    END as avg_views_per_video
  FROM videos 
  WHERE videos.creator_id = $1;
$$;

-- Add an index for performance
CREATE INDEX IF NOT EXISTS idx_videos_creator_analytics 
ON videos(creator_id, num_views, num_likes);
```

### 4. Test Migration Locally (Optional)

If you have local Supabase running:

```bash
# Start local Supabase
supabase start

# Apply migration locally
supabase db reset

# Test your function
supabase db --help
```

### 5. Apply to Remote Database

```bash
# Apply migration to remote database
supabase db push

# Confirm when prompted
```

### 6. Verify Migration

```bash
# Check that migration was applied
supabase migration list

# Test the new function in Supabase dashboard SQL editor
```

## Migration Best Practices

### 1. Naming Conventions

- **Format**: `YYYYMMDDHHMMSS_description.sql`
- **Examples**:
  - `20250529120000_add_song_views_function.sql`
  - `20250529130000_create_analytics_indexes.sql`
  - `20250529140000_add_user_preferences_table.sql`

### 2. Migration Content Guidelines

#### ✅ Good Practices

```sql
-- Always use IF NOT EXISTS for tables/indexes
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}'
);

-- Use CREATE OR REPLACE for functions
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (stat_name TEXT, stat_value BIGINT)
LANGUAGE SQL STABLE AS $$
  -- function body
$$;

-- Include proper indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);
```

#### ❌ Avoid

```sql
-- Don't use CREATE without IF NOT EXISTS
CREATE TABLE user_preferences (...);

-- Don't drop tables/columns without careful consideration
DROP TABLE old_table;

-- Don't use hard-coded UUIDs in production
INSERT INTO creators (id, name) VALUES ('12345678-1234-1234-1234-123456789012', 'Test');
```

### 3. Function Guidelines

#### Preferred Function Style

```sql
CREATE OR REPLACE FUNCTION function_name(param_type TYPE)
RETURNS return_type
LANGUAGE SQL
STABLE  -- Use STABLE for read-only functions
AS $$
  -- SQL query here
$$;
```

#### When to Use Different Volatility

- **STABLE**: Read-only functions (most view computations)
- **IMMUTABLE**: Functions that always return same result for same input
- **VOLATILE**: Functions that modify data or have side effects

### 4. Error Handling in Migrations

```sql
-- Use COALESCE for null handling
SELECT COALESCE(SUM(num_views), 0) as total_views;

-- Use LEFT JOIN for optional relationships
FROM creators c
LEFT JOIN videos v ON v.creator_id = c.id;

-- Validate input parameters
WHERE 
  param_array IS NOT NULL 
  AND array_length(param_array, 1) > 0;
```

## Common Migration Scenarios

### 1. Adding a New Function

```sql
-- Add function for song view computation
CREATE OR REPLACE FUNCTION get_songs_total_views(song_ids UUID[])
RETURNS TABLE (song_id UUID, total_views BIGINT)
LANGUAGE SQL STABLE AS $$
  SELECT 
    s.id as song_id,
    COALESCE(SUM(v.num_views), 0) as total_views
  FROM unnest(song_ids) as s(id)
  LEFT JOIN videos v ON v.song_id = s.id
  GROUP BY s.id;
$$;
```

### 2. Adding Indexes for Performance

```sql
-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_videos_song_id_views 
ON videos(song_id, num_views);

CREATE INDEX IF NOT EXISTS idx_videos_date_posted 
ON videos(date_posted DESC);

CREATE INDEX IF NOT EXISTS idx_creators_followers 
ON creators(num_followers DESC) WHERE num_followers IS NOT NULL;
```

### 3. Adding New Tables

```sql
-- Add user analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  page_views INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints
ALTER TABLE user_analytics 
ADD CONSTRAINT fk_user_analytics_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint
ALTER TABLE user_analytics 
ADD CONSTRAINT uk_user_analytics_user_date 
UNIQUE (user_id, date);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id 
ON user_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_user_analytics_date 
ON user_analytics(date DESC);
```

## Troubleshooting

### Migration Conflicts

If you get migration conflicts:

```bash
# Check current status
supabase migration list

# If you need to mark remote migrations as applied
supabase migration repair --status applied <migration_id>

# If you need to mark migrations as reverted
supabase migration repair --status reverted <migration_id>
```

### Database Connection Issues

```bash
# Re-link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Login again if needed
supabase login
```

### Function Errors

Common issues:

1. **Column doesn't exist**: Check your table schema
2. **Permission denied**: Ensure function has proper security
3. **Type mismatch**: Verify parameter and return types

### Testing Functions

```sql
-- Test in Supabase SQL editor
SELECT * FROM get_creators_total_views(
  ARRAY['uuid1'::UUID, 'uuid2'::UUID]
);

-- Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%views%';
```

## Rollback Strategies

### 1. Function Rollback

If a function needs to be reverted:

```sql
-- Create migration to drop function
DROP FUNCTION IF EXISTS problematic_function(UUID[]);

-- Or revert to previous version
CREATE OR REPLACE FUNCTION fixed_function(UUID[])
-- ... previous working version
```

### 2. Index Rollback

```sql
-- Remove problematic index
DROP INDEX IF EXISTS idx_problematic_index;
```

### 3. Emergency Rollback

For critical issues, you can:

1. Apply a rollback migration
2. Use Supabase dashboard to execute SQL directly
3. Contact Supabase support for assistance

## Security Considerations

### 1. Function Security

```sql
-- Enable Row Level Security for functions that access user data
CREATE OR REPLACE FUNCTION get_user_data(user_id UUID)
SECURITY DEFINER  -- Run with elevated privileges
LANGUAGE SQL STABLE AS $$
  -- Ensure user can only access their own data
  SELECT * FROM user_table 
  WHERE user_table.user_id = $1 
  AND $1 = auth.uid();  -- Verify user identity
$$;
```

### 2. Parameter Validation

```sql
-- Always validate input parameters
CREATE OR REPLACE FUNCTION safe_function(ids UUID[])
RETURNS TABLE(id UUID, value BIGINT)
LANGUAGE SQL STABLE AS $$
  SELECT id, value FROM table_name
  WHERE 
    ids IS NOT NULL 
    AND array_length(ids, 1) > 0
    AND array_length(ids, 1) <= 100  -- Limit batch size
    AND id = ANY(ids);
$$;
```

## Next Steps

After your migration is successful:

1. Update your service layer in `src/lib/viewService.ts`
2. Update TypeScript types if needed
3. Test the new functionality in your components
4. Update documentation if the API changed
5. Consider adding unit tests for the new functionality

For more advanced scenarios, see [EXTENDING_VIEW_SYSTEM.md](./EXTENDING_VIEW_SYSTEM.md). 