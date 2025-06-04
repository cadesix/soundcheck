# View Computation System Documentation

## Overview

This document describes the modular, scalable view computation system built for SoundCheck. The system uses Supabase PostgreSQL functions for efficient database-level computations and a TypeScript service layer for easy integration.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │    │   TypeScript    │    │   PostgreSQL    │
│   Components    │───▶│   Service Layer │───▶│   Functions     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Layer Breakdown

1. **Database Layer**: PostgreSQL functions for computation
2. **Service Layer**: TypeScript functions for data access
3. **Component Layer**: React components consuming the data

## Current Implementation

### Database Functions

Located in: `supabase/migrations/20250529000001_create_creator_views_function.sql`

```sql
CREATE OR REPLACE FUNCTION get_creators_total_views(creator_ids UUID[])
RETURNS TABLE (creator_id UUID, total_views BIGINT)
LANGUAGE SQL STABLE
AS $$
  SELECT 
    c.id as creator_id,
    COALESCE(SUM(v.num_views), 0) as total_views
  FROM unnest(creator_ids) as c(id)
  LEFT JOIN videos v ON v.creator_id = c.id
  GROUP BY c.id;
$$;
```

**Benefits:**
- Computation happens at database level (most efficient)
- Handles large datasets without loading into memory
- Uses `STABLE` marking for potential caching
- Uses `LANGUAGE SQL` for simplicity

### Service Layer

Located in: `src/lib/viewService.ts`

```typescript
export async function getCreatorsViews(creatorIds: string[]): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('get_creators_total_views', {
    creator_ids: creatorIds
  });
  
  if (error) throw error;
  if (!data) return new Map();
  
  return new Map(
    data.map((item: any) => [item.creator_id, item.total_views])
  );
}
```

**Benefits:**
- Returns `Map<string, number>` for O(1) lookups
- Simple error handling
- Type-safe interface

### Component Integration

Example usage in `TopCreatorsTable.tsx`:

```typescript
const [creatorsWithViews, setCreatorsWithViews] = useState<CreatorWithViews[]>(topCreators);

useEffect(() => {
  const fetchViews = async () => {
    if (topCreators.length === 0) return;

    try {
      const creatorIds = topCreators.map(c => c.id);
      const viewsMap = await getCreatorsViews(creatorIds);
      
      const withViews = topCreators.map(creator => ({
        ...creator,
        total_views: viewsMap.get(creator.id) ?? 0
      }));
      
      setCreatorsWithViews(withViews);
    } catch (error) {
      console.error('Error fetching views:', error);
      setCreatorsWithViews(topCreators);
    }
  };

  fetchViews();
}, [topCreators]);
```

## Database Schema Reference

### Key Tables

- `creators`: Contains creator information
- `videos`: Contains video data with `num_views` column
- `songs`: Contains song information

### Key Relationships

- `videos.creator_id` → `creators.id`
- `videos.song_id` → `songs.id`

## Performance Considerations

1. **Batch Operations**: Always fetch views for multiple entities at once
2. **Database Indexing**: Ensure proper indexes on:
   - `videos.creator_id`
   - `videos.song_id`
   - `videos.num_views`
3. **Caching**: Consider implementing React Query for frequent data

## Error Handling

The system includes multiple levels of error handling:

1. **Database Level**: Function returns empty results for invalid IDs
2. **Service Level**: Throws errors for network/DB issues
3. **Component Level**: Graceful fallbacks to original data

## Migration Workflow

### Current Migration Status

```
Local          | Remote         | Status
---------------|----------------|--------
20250527110818 | 20250527110818 | ✓ Synced
20250527111212 | 20250527111212 | ✓ Synced
20250528041507 | 20250528041507 | ✓ Synced
20250529000001 | 20250529000001 | ✓ Applied
```

### Adding New Migrations

1. Create migration file with timestamp > `20250529000001`
2. Write SQL for new function
3. Apply with `supabase db push`
4. Update service layer if needed

## Future Extensions

This system is designed to be easily extended for:

- Song view computations
- Time-period filtering
- Different aggregation types
- Real-time updates

See [EXTENDING_VIEW_SYSTEM.md](./EXTENDING_VIEW_SYSTEM.md) for detailed instructions. 