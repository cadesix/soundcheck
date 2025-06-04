# Extending the View Computation System

## Adding New Entity Types

### Example: Songs View Computation

#### 1. Create Database Function

Create a new migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_song_views_function.sql`

```sql
-- Function to get total views for songs
CREATE OR REPLACE FUNCTION get_songs_total_views(song_ids UUID[])
RETURNS TABLE (song_id UUID, total_views BIGINT)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    s.id as song_id,
    COALESCE(SUM(v.num_views), 0) as total_views
  FROM unnest(song_ids) as s(id)
  LEFT JOIN videos v ON v.song_id = s.id
  GROUP BY s.id;
$$;
```

#### 2. Add Service Function

Add to `src/lib/viewService.ts`:

```typescript
export async function getSongsViews(songIds: string[]): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('get_songs_total_views', {
    song_ids: songIds
  });
  
  if (error) throw error;
  if (!data) return new Map();
  
  return new Map(
    data.map((item: any) => [item.song_id, item.total_views])
  );
}
```

#### 3. Use in Components

```typescript
// In your songs component
const [songsWithViews, setSongsWithViews] = useState<SongWithViews[]>(songs);

useEffect(() => {
  const fetchViews = async () => {
    try {
      const songIds = songs.map(s => s.id);
      const viewsMap = await getSongsViews(songIds);
      
      const withViews = songs.map(song => ({
        ...song,
        total_views: viewsMap.get(song.id) ?? 0
      }));
      
      setSongsWithViews(withViews);
    } catch (error) {
      console.error('Error fetching song views:', error);
    }
  };

  fetchViews();
}, [songs]);
```

## Adding Time-Based Filtering

### Database Function with Date Range

```sql
-- Enhanced function with date filtering
CREATE OR REPLACE FUNCTION get_creators_total_views_by_period(
  creator_ids UUID[],
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (creator_id UUID, total_views BIGINT)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    c.id as creator_id,
    COALESCE(SUM(v.num_views), 0) as total_views
  FROM unnest(creator_ids) as c(id)
  LEFT JOIN videos v ON v.creator_id = c.id
  WHERE 
    (start_date IS NULL OR v.date_posted >= start_date)
    AND (end_date IS NULL OR v.date_posted <= end_date)
  GROUP BY c.id;
$$;
```

### Service Function

```typescript
export async function getCreatorsViewsByPeriod(
  creatorIds: string[],
  startDate?: Date,
  endDate?: Date
): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('get_creators_total_views_by_period', {
    creator_ids: creatorIds,
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString()
  });
  
  if (error) throw error;
  if (!data) return new Map();
  
  return new Map(
    data.map((item: any) => [item.creator_id, item.total_views])
  );
}
```

## Adding Periodic View Analysis

### Database Function for Time Series

```sql
-- Function to get views by time period (daily, weekly, monthly)
CREATE OR REPLACE FUNCTION get_creators_views_by_period(
  creator_ids UUID[],
  period_type TEXT, -- 'day', 'week', 'month'
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  creator_id UUID,
  period_start TIMESTAMP WITH TIME ZONE,
  period_views BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    v.creator_id,
    date_trunc(period_type, v.date_posted) as period_start,
    COALESCE(SUM(v.num_views), 0) as period_views
  FROM videos v
  WHERE 
    v.creator_id = ANY(creator_ids)
    AND (start_date IS NULL OR v.date_posted >= start_date)
    AND (end_date IS NULL OR v.date_posted <= end_date)
  GROUP BY v.creator_id, period_start
  ORDER BY period_start;
$$;
```

### Service Function for Time Series

```typescript
export type TimePeriod = 'day' | 'week' | 'month';

export interface PeriodViews {
  period_start: string;
  views: number;
}

export async function getCreatorsViewsByPeriod(
  creatorIds: string[],
  period: TimePeriod,
  startDate?: Date,
  endDate?: Date
): Promise<Map<string, PeriodViews[]>> {
  const { data, error } = await supabase.rpc('get_creators_views_by_period', {
    creator_ids: creatorIds,
    period_type: period,
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString()
  });
  
  if (error) throw error;
  if (!data) return new Map();
  
  // Group by creator_id
  const result = new Map<string, PeriodViews[]>();
  data.forEach((item: any) => {
    const existing = result.get(item.creator_id) || [];
    result.set(item.creator_id, [
      ...existing,
      {
        period_start: item.period_start,
        views: item.period_views
      }
    ]);
  });
  
  return result;
}
```

## Best Practices

### 1. Function Naming Convention

- Use descriptive names: `get_[entity]_[metric]_[qualifier]`
- Examples:
  - `get_creators_total_views`
  - `get_songs_views_by_period` 
  - `get_artists_weekly_impressions`

### 2. Migration Naming

- Format: `YYYYMMDDHHMMSS_description.sql`
- Use descriptive names
- Keep migrations atomic (one feature per migration)

### 3. Error Handling

Always include comprehensive error handling:

```typescript
export async function getEntityViews(ids: string[]): Promise<Map<string, number>> {
  try {
    const { data, error } = await supabase.rpc('function_name', { ids });
    
    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch views: ${error.message}`);
    }
    
    if (!data) {
      console.warn('No data returned from database');
      return new Map();
    }
    
    return new Map(data.map((item: any) => [item.id, item.views]));
  } catch (error) {
    console.error('Service error:', error);
    throw error; // Re-throw for component handling
  }
}
```

### 4. Component Integration Pattern

```typescript
const useEntityViews = (entities: Entity[]) => {
  const [entitiesWithViews, setEntitiesWithViews] = useState<EntityWithViews[]>(entities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      if (entities.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const ids = entities.map(e => e.id);
        const viewsMap = await getEntityViews(ids);
        
        const withViews = entities.map(entity => ({
          ...entity,
          total_views: viewsMap.get(entity.id) ?? 0
        }));
        
        setEntitiesWithViews(withViews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setEntitiesWithViews(entities); // Fallback to original data
      } finally {
        setLoading(false);
      }
    };

    fetchViews();
  }, [entities]);

  return { entitiesWithViews, loading, error };
};
```

## Testing New Functions

### 1. Database Testing

```sql
-- Test your function directly in Supabase SQL editor
SELECT * FROM get_creators_total_views(ARRAY['creator-id-1'::UUID, 'creator-id-2'::UUID]);
```

### 2. Service Testing

```typescript
// Add to a test component or console
const testFunction = async () => {
  try {
    const result = await getCreatorsViews(['creator-id-1', 'creator-id-2']);
    console.log('Views map:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};
```

## Performance Optimization

### 1. Database Indexes

Ensure proper indexes exist:

```sql
-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_videos_creator_id_date ON videos(creator_id, date_posted);
CREATE INDEX IF NOT EXISTS idx_videos_song_id_views ON videos(song_id, num_views);
CREATE INDEX IF NOT EXISTS idx_videos_views_desc ON videos(num_views DESC);
```

### 2. Batch Operations

Always fetch data in batches:

```typescript
// Good: Batch operation
const viewsMap = await getCreatorsViews(['id1', 'id2', 'id3']);

// Bad: Multiple individual calls
const views1 = await getCreatorsViews(['id1']);
const views2 = await getCreatorsViews(['id2']);
const views3 = await getCreatorsViews(['id3']);
```

### 3. Caching Considerations

For frequently accessed data, consider:

- React Query for client-side caching
- Redis for server-side caching
- Materialized views for complex aggregations

## Common Patterns

### 1. Aggregation Functions

```sql
-- Sum
COALESCE(SUM(v.num_views), 0)

-- Average
COALESCE(AVG(v.num_views), 0)

-- Count
COUNT(v.id)

-- Max/Min
COALESCE(MAX(v.num_views), 0)
```

### 2. Time-based Filtering

```sql
-- Last 7 days
WHERE v.date_posted >= NOW() - INTERVAL '7 days'

-- Current month
WHERE date_trunc('month', v.date_posted) = date_trunc('month', NOW())

-- Between dates
WHERE v.date_posted BETWEEN start_date AND end_date
```

### 3. Error Handling in SQL

```sql
-- Using COALESCE for null handling
COALESCE(SUM(v.num_views), 0) as total_views

-- Using LEFT JOIN for optional relationships
LEFT JOIN videos v ON v.creator_id = c.id
``` 