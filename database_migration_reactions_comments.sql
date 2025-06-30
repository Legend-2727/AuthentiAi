-- Run this SQL in your Supabase SQL Editor to add reactions and comments functionality

-- Create reactions table for audio posts
CREATE TABLE IF NOT EXISTS audio_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_post_id UUID REFERENCES audio_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audio_post_id, user_id)  -- One reaction per user per post
);

-- Create comments table for audio posts
CREATE TABLE IF NOT EXISTS audio_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_post_id UUID REFERENCES audio_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audio_post_reactions_post_id ON audio_post_reactions(audio_post_id);
CREATE INDEX IF NOT EXISTS idx_audio_post_reactions_user_id ON audio_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_post_comments_post_id ON audio_post_comments(audio_post_id);
CREATE INDEX IF NOT EXISTS idx_audio_post_comments_user_id ON audio_post_comments(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE audio_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_post_comments ENABLE ROW LEVEL SECURITY;

-- Policies for reactions
CREATE POLICY IF NOT EXISTS "Users can view all reactions" ON audio_post_reactions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can create their own reactions" ON audio_post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own reactions" ON audio_post_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own reactions" ON audio_post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY IF NOT EXISTS "Users can view all comments" ON audio_post_comments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can create their own comments" ON audio_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own comments" ON audio_post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own comments" ON audio_post_comments FOR DELETE USING (auth.uid() = user_id);

-- Add some sample data for testing (optional)
-- You can remove this part if you don't want sample data
DO $$
DECLARE
    sample_audio_post_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get a sample audio post ID if any exists
    SELECT id INTO sample_audio_post_id FROM audio_posts LIMIT 1;
    
    -- Get a sample user ID if any exists
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Only insert sample data if we have both
    IF sample_audio_post_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
        -- Insert sample reactions
        INSERT INTO audio_post_reactions (audio_post_id, user_id, reaction_type) 
        VALUES 
            (sample_audio_post_id, sample_user_id, 'like')
        ON CONFLICT (audio_post_id, user_id) DO NOTHING;
        
        -- Insert sample comments
        INSERT INTO audio_post_comments (audio_post_id, user_id, content) 
        VALUES 
            (sample_audio_post_id, sample_user_id, 'This is a great audio post! Thanks for sharing.')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
