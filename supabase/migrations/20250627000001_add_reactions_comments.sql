-- Create reactions table for audio posts
CREATE TABLE audio_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_post_id UUID REFERENCES audio_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(audio_post_id, user_id)  -- One reaction per user per post
);

-- Create comments table for audio posts
CREATE TABLE audio_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_post_id UUID REFERENCES audio_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_audio_post_reactions_post_id ON audio_post_reactions(audio_post_id);
CREATE INDEX idx_audio_post_reactions_user_id ON audio_post_reactions(user_id);
CREATE INDEX idx_audio_post_comments_post_id ON audio_post_comments(audio_post_id);
CREATE INDEX idx_audio_post_comments_user_id ON audio_post_comments(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE audio_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_post_comments ENABLE ROW LEVEL SECURITY;

-- Policies for reactions
CREATE POLICY "Users can view all reactions" ON audio_post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own reactions" ON audio_post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reactions" ON audio_post_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON audio_post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Policies for comments
CREATE POLICY "Users can view all comments" ON audio_post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own comments" ON audio_post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON audio_post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON audio_post_comments FOR DELETE USING (auth.uid() = user_id);
