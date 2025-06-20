/*
  # Create Social Media Feed Tables

  1. New Tables
    - `creators` - Creator profiles for the social feed
    - `feed_posts` - Video and audio posts in the social feed
    - `reactions` - User reactions to posts (❤️, 👏, 🔥, 🎵)
    - `comments` - Comments on posts with threading support
    - `star_donations` - Star donations between users
    - `follows` - User following relationships

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table

  3. Sample Data
    - Insert sample creators, posts, reactions, comments, and donations
*/

-- Create creators table (extended user profiles for social features)
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  profile_img_url text DEFAULT 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=random',
  verified boolean DEFAULT false,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Create feed_posts table
CREATE TABLE IF NOT EXISTS feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('video', 'audio')),
  title text NOT NULL,
  description text,
  content_url text NOT NULL,
  thumbnail_url text,
  duration integer NOT NULL, -- in seconds
  tags text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('❤️', '👏', '🔥', '🎵')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL CHECK (length(content) <= 500),
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create star_donations table
CREATE TABLE IF NOT EXISTS star_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  star_count integer NOT NULL CHECK (star_count >= 10),
  message text,
  created_at timestamptz DEFAULT now()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on all tables
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create policies for creators
CREATE POLICY "Anyone can view creators" ON creators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own creator profile" ON creators FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own creator profile" ON creators FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create policies for feed_posts
CREATE POLICY "Anyone can view feed posts" ON feed_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators can insert their own posts" ON feed_posts FOR INSERT TO authenticated WITH CHECK (
  creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
);
CREATE POLICY "Creators can update their own posts" ON feed_posts FOR UPDATE TO authenticated USING (
  creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
);
CREATE POLICY "Creators can delete their own posts" ON feed_posts FOR DELETE TO authenticated USING (
  creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
);

-- Create policies for reactions
CREATE POLICY "Anyone can view reactions" ON reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own reactions" ON reactions FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create policies for comments
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Create policies for star_donations
CREATE POLICY "Anyone can view star donations" ON star_donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send star donations" ON star_donations FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());

-- Create policies for follows
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their own follows" ON follows FOR ALL TO authenticated USING (follower_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creators_username ON creators(username);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_creator_id ON feed_posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_view_count ON feed_posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_star_donations_post_id ON star_donations(post_id);
CREATE INDEX IF NOT EXISTS idx_star_donations_to_user_id ON star_donations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Insert sample creators
INSERT INTO creators (id, username, display_name, profile_img_url, verified, follower_count, bio) VALUES
('creator-1', 'techguru_alex', 'Alex Chen', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=alex', true, 15420, 'Tech educator sharing the latest in AI and software development'),
('creator-2', 'musicmaker_sam', 'Sam Rodriguez', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=sam', true, 8930, 'Music producer and audio engineer creating beats and tutorials'),
('creator-3', 'storyteller_maya', 'Maya Patel', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=maya', false, 3250, 'Storyteller and podcast host sharing life experiences'),
('creator-4', 'fitness_coach_mike', 'Mike Johnson', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=mike', true, 22100, 'Certified fitness trainer helping you reach your goals'),
('creator-5', 'artist_luna', 'Luna Kim', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=luna', false, 5670, 'Digital artist and creative content creator');

-- Insert sample video posts
INSERT INTO feed_posts (id, creator_id, type, title, description, content_url, thumbnail_url, duration, tags, view_count, created_at) VALUES
('post-1', 'creator-1', 'video', 'Building AI Apps with React and OpenAI', 'Learn how to integrate OpenAI APIs into your React applications', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://picsum.photos/640/360?random=1', 180, ARRAY['ai', 'react', 'tutorial'], 1250, NOW() - INTERVAL '2 hours'),
('post-2', 'creator-4', 'video', '10-Minute Morning Workout Routine', 'Start your day right with this energizing workout', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 'https://picsum.photos/640/360?random=2', 600, ARRAY['fitness', 'workout', 'morning'], 890, NOW() - INTERVAL '5 hours'),
('post-3', 'creator-3', 'video', 'My Journey as a Solo Traveler', 'Sharing stories and tips from my adventures around the world', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 'https://picsum.photos/640/360?random=3', 420, ARRAY['travel', 'lifestyle', 'story'], 2100, NOW() - INTERVAL '1 day'),
('post-4', 'creator-1', 'video', 'JavaScript Tips Every Developer Should Know', 'Advanced JavaScript concepts explained simply', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://picsum.photos/640/360?random=4', 300, ARRAY['javascript', 'programming', 'tips'], 3400, NOW() - INTERVAL '2 days'),
('post-5', 'creator-5', 'video', 'Digital Art Process: Creating Fantasy Landscapes', 'Watch me create a magical landscape from scratch', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 'https://picsum.photos/640/360?random=5', 900, ARRAY['art', 'digital', 'fantasy'], 1800, NOW() - INTERVAL '3 days');

-- Insert sample audio posts
INSERT INTO feed_posts (id, creator_id, type, title, description, content_url, duration, tags, view_count, created_at) VALUES
('post-6', 'creator-2', 'audio', 'Chill Lo-Fi Beats for Studying', 'Relaxing instrumental music to help you focus', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 120, ARRAY['music', 'lofi', 'study'], 5200, NOW() - INTERVAL '4 hours'),
('post-7', 'creator-3', 'audio', 'Podcast: The Art of Mindful Living', 'Exploring mindfulness practices for daily life', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 1800, ARRAY['podcast', 'mindfulness', 'wellness'], 980, NOW() - INTERVAL '6 hours'),
('post-8', 'creator-2', 'audio', 'Behind the Beat: Making Hip-Hop', 'Breaking down my production process', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 900, ARRAY['music', 'hiphop', 'production'], 1450, NOW() - INTERVAL '1 day'),
('post-9', 'creator-1', 'audio', 'Tech Talk: The Future of Web Development', 'Discussing upcoming trends and technologies', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 2100, ARRAY['tech', 'web', 'future'], 2300, NOW() - INTERVAL '2 days'),
('post-10', 'creator-3', 'audio', 'Bedtime Stories for Adults', 'Calming narratives to help you unwind', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 1200, ARRAY['story', 'relaxation', 'sleep'], 3100, NOW() - INTERVAL '3 days');

-- Insert sample reactions (distributed across posts)
INSERT INTO reactions (post_id, user_id, type) VALUES
-- Post 1 reactions
('post-1', 'creator-2', '❤️'),
('post-1', 'creator-3', '👏'),
('post-1', 'creator-4', '🔥'),
-- Post 2 reactions  
('post-2', 'creator-1', '❤️'),
('post-2', 'creator-3', '💪'),
('post-2', 'creator-5', '🔥'),
-- Post 6 reactions
('post-6', 'creator-1', '🎵'),
('post-6', 'creator-3', '❤️'),
('post-6', 'creator-4', '👏');

-- Insert sample comments
INSERT INTO comments (post_id, user_id, content, like_count, created_at) VALUES
('post-1', 'creator-2', 'Great tutorial! Really helped me understand the OpenAI integration.', 5, NOW() - INTERVAL '1 hour'),
('post-1', 'creator-3', 'The code examples were super clear. Thanks for sharing!', 3, NOW() - INTERVAL '30 minutes'),
('post-2', 'creator-1', 'Perfect timing! Just what I needed for my morning routine.', 8, NOW() - INTERVAL '4 hours'),
('post-2', 'creator-5', 'Love the energy in this workout. Definitely trying it tomorrow!', 2, NOW() - INTERVAL '3 hours'),
('post-6', 'creator-4', 'This beat is so smooth! Perfect for my study sessions.', 12, NOW() - INTERVAL '2 hours'),
('post-6', 'creator-1', 'Amazing production quality. How long did this take to make?', 4, NOW() - INTERVAL '1 hour'),
('post-7', 'creator-2', 'Your voice is so calming. This really helped me relax.', 7, NOW() - INTERVAL '5 hours'),
('post-9', 'creator-5', 'Fascinating insights about the future of web dev!', 6, NOW() - INTERVAL '1 day');

-- Insert sample star donations
INSERT INTO star_donations (post_id, from_user_id, to_user_id, star_count, message, created_at) VALUES
('post-1', 'creator-2', 'creator-1', 50, 'Excellent tutorial! Keep up the great work!', NOW() - INTERVAL '1 hour'),
('post-2', 'creator-1', 'creator-4', 25, 'Thanks for the motivation!', NOW() - INTERVAL '3 hours'),
('post-6', 'creator-3', 'creator-2', 100, 'This beat is incredible! 🎵', NOW() - INTERVAL '2 hours'),
('post-7', 'creator-4', 'creator-3', 30, 'Really needed to hear this today', NOW() - INTERVAL '4 hours'),
('post-9', 'creator-5', 'creator-1', 75, 'Great insights as always!', NOW() - INTERVAL '1 day'),
('post-3', 'creator-2', 'creator-3', 40, 'Your stories are so inspiring!', NOW() - INTERVAL '20 hours'),
('post-5', 'creator-1', 'creator-5', 60, 'Amazing artistic process!', NOW() - INTERVAL '2 days'),
('post-8', 'creator-4', 'creator-2', 35, 'Love learning about your process', NOW() - INTERVAL '20 hours');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for feed_posts updated_at
CREATE TRIGGER update_feed_posts_updated_at
  BEFORE UPDATE ON feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();