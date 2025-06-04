-- Migrate existing tracked creators to artist_clippers table
-- This assumes you want to associate all existing tracked creators with the first artist
-- You may need to adjust this logic based on your specific needs

INSERT INTO artist_clippers (artist_id, creator_id, added_by)
SELECT 
  (SELECT id FROM artists LIMIT 1) as artist_id,
  c.id as creator_id,
  'migration' as added_by
FROM creators c
WHERE c.is_tracked = true
ON CONFLICT (artist_id, creator_id) DO NOTHING;

-- Optional: Remove the is_tracked column since we're now using the link table
-- Uncomment the line below if you want to remove the is_tracked column
-- ALTER TABLE creators DROP COLUMN IF EXISTS is_tracked; 