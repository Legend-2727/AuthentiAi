-- Manual SQL to create the full videos table
-- Run this in the Supabase SQL Editor if you want the full featured table

-- Drop and recreate the videos table with full features
DROP TABLE IF EXISTS videos CASCADE;

CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  script TEXT NOT NULL,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'generating')),
  replica_id TEXT,
  replica_type TEXT CHECK (replica_type IN ('user', 'system')),
  tavus_video_id TEXT,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  duration INTEGER,
  generation_type TEXT NOT NULL DEFAULT 'upload' CHECK (generation_type IN ('personal_replica', 'stock_replica', 'upload')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_generation_type ON videos(generation_type);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own videos" ON videos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos" ON videos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos" ON videos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos" ON videos
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON videos TO authenticated;
GRANT ALL ON videos TO anon;
