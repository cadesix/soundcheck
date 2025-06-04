-- Function to get total views for songs
-- Aggregates view counts from all videos that use each song
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