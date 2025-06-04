-- Create artist_clippers link table
-- Links artists to creators they want to track (clippers)
CREATE TABLE artist_clippers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artist_id, creator_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_artist_clippers_artist_id ON artist_clippers(artist_id);
CREATE INDEX idx_artist_clippers_creator_id ON artist_clippers(creator_id); 