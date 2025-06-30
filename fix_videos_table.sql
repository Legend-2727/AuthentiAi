-- Manual fix for videos table - add missing columns
-- Run this in your Supabase SQL Editor

-- First, let's check if the table exists and what columns it has
-- You can run this first to see the current structure:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'videos';

-- Add missing columns to the videos table
-- Run each ALTER TABLE statement one by one

-- Add description column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'description') THEN
        ALTER TABLE videos ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add replica_id column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'replica_id') THEN
        ALTER TABLE videos ADD COLUMN replica_id TEXT;
    END IF;
END $$;

-- Add replica_type column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'replica_type') THEN
        ALTER TABLE videos ADD COLUMN replica_type TEXT CHECK (replica_type IN ('user', 'system'));
    END IF;
END $$;

-- Add tavus_video_id column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'tavus_video_id') THEN
        ALTER TABLE videos ADD COLUMN tavus_video_id TEXT;
    END IF;
END $$;

-- Add tags column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'tags') THEN
        ALTER TABLE videos ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add thumbnail_url column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE videos ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- Add duration column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'duration') THEN
        ALTER TABLE videos ADD COLUMN duration INTEGER;
    END IF;
END $$;

-- Add generation_type column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'generation_type') THEN
        ALTER TABLE videos ADD COLUMN generation_type TEXT NOT NULL DEFAULT 'upload' CHECK (generation_type IN ('personal_replica', 'stock_replica', 'upload'));
    END IF;
END $$;

-- Add updated_at column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'updated_at') THEN
        ALTER TABLE videos ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Update the status column to include new values if needed
DO $$ 
BEGIN 
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'videos_status_check' AND table_name = 'videos') THEN
        ALTER TABLE videos DROP CONSTRAINT videos_status_check;
    END IF;
    
    -- Add updated constraint
    ALTER TABLE videos ADD CONSTRAINT videos_status_check CHECK (status IN ('processing', 'completed', 'failed', 'generating'));
END $$;

-- Create function to automatically update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_generation_type ON videos(generation_type);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Enable RLS if not already enabled
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN 
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
    DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;
    
    -- Create new policies
    CREATE POLICY "Users can view their own videos" ON videos FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own videos" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own videos" ON videos FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own videos" ON videos FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Check the final structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'videos' 
ORDER BY ordinal_position;
