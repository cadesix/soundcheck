-- Create processed_images table
CREATE TABLE IF NOT EXISTS processed_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_url TEXT NOT NULL,
    processed_url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('profile', 'thumbnail', 'cover')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(original_url)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_processed_images_original_url ON processed_images(original_url);
CREATE INDEX IF NOT EXISTS idx_processed_images_type ON processed_images(type); 