-- Create restaurants table
CREATE TABLE restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create creators table
CREATE TABLE creators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_name TEXT NOT NULL,
    creator_url TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_creator_url UNIQUE (creator_url)
);

-- Create videos table
CREATE TABLE videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id TEXT NOT NULL UNIQUE,  -- The unique ID from your video source
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    date_posted TIMESTAMP WITH TIME ZONE NOT NULL,
    web_video_url TEXT NOT NULL,
    overview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON creators FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON videos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON comments FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_creators_updated_at
    BEFORE UPDATE ON creators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 