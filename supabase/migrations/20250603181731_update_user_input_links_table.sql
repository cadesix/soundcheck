-- Create user_input_links table if it doesn't exist, or add artist_id column if it does
CREATE TABLE IF NOT EXISTS user_input_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' -- 'pending', 'processing', 'completed', 'failed'
);

-- Add artist_id column if table already exists but doesn't have it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_input_links' AND column_name = 'artist_id'
  ) THEN
    ALTER TABLE user_input_links ADD COLUMN artist_id UUID REFERENCES artists(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_input_links_artist_id ON user_input_links(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_input_links_status ON user_input_links(status); 