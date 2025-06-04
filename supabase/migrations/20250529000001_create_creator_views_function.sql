-- Simple function to get total views for creators
-- Start with just the essential functionality
CREATE OR REPLACE FUNCTION get_creators_total_views(creator_ids UUID[])
RETURNS TABLE (creator_id UUID, total_views BIGINT)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    c.id as creator_id,
    COALESCE(SUM(v.num_views), 0) as total_views
  FROM unnest(creator_ids) as c(id)
  LEFT JOIN videos v ON v.creator_id = c.id
  GROUP BY c.id;
$$;
