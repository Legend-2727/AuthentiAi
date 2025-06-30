/*
  # Social Media Feed Tables

  1. New Tables
    - `creators` - Extended user profiles for social features
    - `feed_posts` - Video and audio content posts
    - `reactions` - User reactions to posts
    - `comments` - Threaded comment system
    - `star_donations` - Monetization system
    - `follows` - User relationship management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper access control for creators and content

  3. Sample Data
    - Sample creators with realistic profiles
    - Mix of video and audio posts
    - Comments, reactions, and star donations
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

-- Create policies with conditional checks to avoid conflicts
DO $$
BEGIN
  -- Policies for creators
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creators' AND policyname = 'Anyone can view creators') THEN
    CREATE POLICY "Anyone can view creators" ON creators FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creators' AND policyname = 'Users can update their own creator profile') THEN
    CREATE POLICY "Users can update their own creator profile" ON creators FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'creators' AND policyname = 'Users can insert their own creator profile') THEN
    CREATE POLICY "Users can insert their own creator profile" ON creators FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;

  -- Policies for feed_posts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_posts' AND policyname = 'Anyone can view feed posts') THEN
    CREATE POLICY "Anyone can view feed posts" ON feed_posts FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_posts' AND policyname = 'Creators can insert their own posts') THEN
    CREATE POLICY "Creators can insert their own posts" ON feed_posts FOR INSERT TO authenticated WITH CHECK (
      creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_posts' AND policyname = 'Creators can update their own posts') THEN
    CREATE POLICY "Creators can update their own posts" ON feed_posts FOR UPDATE TO authenticated USING (
      creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_posts' AND policyname = 'Creators can delete their own posts') THEN
    CREATE POLICY "Creators can delete their own posts" ON feed_posts FOR DELETE TO authenticated USING (
      creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
    );
  END IF;

  -- Policies for reactions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Anyone can view reactions') THEN
    CREATE POLICY "Anyone can view reactions" ON reactions FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reactions' AND policyname = 'Users can manage their own reactions') THEN
    CREATE POLICY "Users can manage their own reactions" ON reactions FOR ALL TO authenticated USING (user_id = auth.uid());
  END IF;

  -- Policies for comments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Anyone can view comments') THEN
    CREATE POLICY "Anyone can view comments" ON comments FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can insert comments') THEN
    CREATE POLICY "Users can insert comments" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can update their own comments') THEN
    CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can delete their own comments') THEN
    CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;

  -- Policies for star_donations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'star_donations' AND policyname = 'Anyone can view star donations') THEN
    CREATE POLICY "Anyone can view star donations" ON star_donations FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'star_donations' AND policyname = 'Users can send star donations') THEN
    CREATE POLICY "Users can send star donations" ON star_donations FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());
  END IF;

  -- Policies for follows
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Anyone can view follows') THEN
    CREATE POLICY "Anyone can view follows" ON follows FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can manage their own follows') THEN
    CREATE POLICY "Users can manage their own follows" ON follows FOR ALL TO authenticated USING (follower_id = auth.uid());
  END IF;
END $$;

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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for feed_posts updated_at
DROP TRIGGER IF EXISTS update_feed_posts_updated_at ON feed_posts;
CREATE TRIGGER update_feed_posts_updated_at
  BEFORE UPDATE ON feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample creators using proper UUIDs
DO $$
DECLARE
  creator1_id uuid := gen_random_uuid();
  creator2_id uuid := gen_random_uuid();
  creator3_id uuid := gen_random_uuid();
  creator4_id uuid := gen_random_uuid();
  creator5_id uuid := gen_random_uuid();
  
  post1_id uuid := gen_random_uuid();
  post2_id uuid := gen_random_uuid();
  post3_id uuid := gen_random_uuid();
  post4_id uuid := gen_random_uuid();
  post5_id uuid := gen_random_uuid();
  post6_id uuid := gen_random_uuid();
  post7_id uuid := gen_random_uuid();
  post8_id uuid := gen_random_uuid();
  post9_id uuid := gen_random_uuid();
  post10_id uuid := gen_random_uuid();
  
  sample_user_id uuid;
BEGIN
  -- Get a sample user ID from existing users table (if any exists)
  SELECT id INTO sample_user_id FROM users LIMIT 1;
  
  -- Insert sample creators (only if they don't exist)
  INSERT INTO creators (id, username, display_name, profile_img_url, verified, follower_count, bio) VALUES
  (creator1_id, 'techguru_alex', 'Alex Chen', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=alex', true, 15420, 'Tech educator sharing the latest in AI and software development'),
  (creator2_id, 'musicmaker_sam', 'Sam Rodriguez', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=sam', true, 8930, 'Music producer and audio engineer creating beats and tutorials'),
  (creator3_id, 'storyteller_maya', 'Maya Patel', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=maya', false, 3250, 'Storyteller and podcast host sharing life experiences'),
  (creator4_id, 'fitness_coach_mike', 'Mike Johnson', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=mike', true, 22100, 'Certified fitness trainer helping you reach your goals'),
  (creator5_id, 'artist_luna', 'Luna Kim', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=luna', false, 5670, 'Digital artist and creative content creator')
  ON CONFLICT (username) DO NOTHING;

  -- Insert sample video posts
  INSERT INTO feed_posts (id, creator_id, type, title, description, content_url, thumbnail_url, duration, tags, view_count, created_at) VALUES
  (post1_id, creator1_id, 'video', 'Building AI Apps with React and OpenAI', 'Learn how to integrate OpenAI APIs into your React applications', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://picsum.photos/640/360?random=1', 180, ARRAY['ai', 'react', 'tutorial'], 1250, NOW() - INTERVAL '2 hours'),
  (post2_id, creator4_id, 'video', '10-Minute Morning Workout Routine', 'Start your day right with this energizing workout', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 'https://picsum.photos/640/360?random=2', 600, ARRAY['fitness', 'workout', 'morning'], 890, NOW() - INTERVAL '5 hours'),
  (post3_id, creator3_id, 'video', 'My Journey as a Solo Traveler', 'Sharing stories and tips from my adventures around the world', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4', 'https://picsum.photos/640/360?random=3', 420, ARRAY['travel', 'lifestyle', 'story'], 2100, NOW() - INTERVAL '1 day'),
  (post4_id, creator1_id, 'video', 'JavaScript Tips Every Developer Should Know', 'Advanced JavaScript concepts explained simply', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'https://picsum.photos/640/360?random=4', 300, ARRAY['javascript', 'programming', 'tips'], 3400, NOW() - INTERVAL '2 days'),
  (post5_id, creator5_id, 'video', 'Digital Art Process: Creating Fantasy Landscapes', 'Watch me create a magical landscape from scratch', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 'https://picsum.photos/640/360?random=5', 900, ARRAY['art', 'digital', 'fantasy'], 1800, NOW() - INTERVAL '3 days')
  ON CONFLICT (id) DO NOTHING;

  -- Insert sample audio posts
  INSERT INTO feed_posts (id, creator_id, type, title, description, content_url, duration, tags, view_count, created_at) VALUES
  (post6_id, creator2_id, 'audio', 'Chill Lo-Fi Beats for Studying', 'Relaxing instrumental music to help you focus', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 120, ARRAY['music', 'lofi', 'study'], 5200, NOW() - INTERVAL '4 hours'),
  (post7_id, creator3_id, 'audio', 'Podcast: The Art of Mindful Living', 'Exploring mindfulness practices for daily life', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 1800, ARRAY['podcast', 'mindfulness', 'wellness'], 980, NOW() - INTERVAL '6 hours'),
  (post8_id, creator2_id, 'audio', 'Behind the Beat: Making Hip-Hop', 'Breaking down my production process', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 900, ARRAY['music', 'hiphop', 'production'], 1450, NOW() - INTERVAL '1 day'),
  (post9_id, creator1_id, 'audio', 'Tech Talk: The Future of Web Development', 'Discussing upcoming trends and technologies', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 2100, ARRAY['tech', 'web', 'future'], 2300, NOW() - INTERVAL '2 days'),
  (post10_id, creator3_id, 'audio', 'Bedtime Stories for Adults', 'Calming narratives to help you unwind', 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 1200, ARRAY['story', 'relaxation', 'sleep'], 3100, NOW() - INTERVAL '3 days')
  ON CONFLICT (id) DO NOTHING;

  -- Only insert sample data if we have users (to avoid foreign key errors)
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample reactions (distributed across posts)
    INSERT INTO reactions (post_id, user_id, type) VALUES
    -- Post 1 reactions
    (post1_id, sample_user_id, '❤️'),
    (post1_id, sample_user_id, '👏'),
    (post1_id, sample_user_id, '🔥'),
    -- Post 2 reactions  
    (post2_id, sample_user_id, '❤️'),
    (post2_id, sample_user_id, '🎵'),
    (post2_id, sample_user_id, '🔥'),
    -- Post 6 reactions
    (post6_id, sample_user_id, '🎵'),
    (post6_id, sample_user_id, '❤️'),
    (post6_id, sample_user_id, '👏')
    ON CONFLICT (post_id, user_id) DO NOTHING;

    -- Insert sample comments
    INSERT INTO comments (post_id, user_id, content, like_count, created_at) VALUES
    (post1_id, sample_user_id, 'Great tutorial! Really helped me understand the OpenAI integration.', 5, NOW() - INTERVAL '1 hour'),
    (post1_id, sample_user_id, 'The code examples were super clear. Thanks for sharing!', 3, NOW() - INTERVAL '30 minutes'),
    (post2_id, sample_user_id, 'Perfect timing! Just what I needed for my morning routine.', 8, NOW() - INTERVAL '4 hours'),
    (post2_id, sample_user_id, 'Love the energy in this workout. Definitely trying it tomorrow!', 2, NOW() - INTERVAL '3 hours'),
    (post6_id, sample_user_id, 'This beat is so smooth! Perfect for my study sessions.', 12, NOW() - INTERVAL '2 hours'),
    (post6_id, sample_user_id, 'Amazing production quality. How long did this take to make?', 4, NOW() - INTERVAL '1 hour'),
    (post7_id, sample_user_id, 'Your voice is so calming. This really helped me relax.', 7, NOW() - INTERVAL '5 hours'),
    (post9_id, sample_user_id, 'Fascinating insights about the future of web dev!', 6, NOW() - INTERVAL '1 day');

    -- Insert sample star donations
    INSERT INTO star_donations (post_id, from_user_id, to_user_id, star_count, message, created_at) VALUES
    (post1_id, sample_user_id, sample_user_id, 50, 'Excellent tutorial! Keep up the great work!', NOW() - INTERVAL '1 hour'),
    (post2_id, sample_user_id, sample_user_id, 25, 'Thanks for the motivation!', NOW() - INTERVAL '3 hours'),
    (post6_id, sample_user_id, sample_user_id, 100, 'This beat is incredible! 🎵', NOW() - INTERVAL '2 hours'),
    (post7_id, sample_user_id, sample_user_id, 30, 'Really needed to hear this today', NOW() - INTERVAL '4 hours'),
    (post9_id, sample_user_id, sample_user_id, 75, 'Great insights as always!', NOW() - INTERVAL '1 day'),
    (post3_id, sample_user_id, sample_user_id, 40, 'Your stories are so inspiring!', NOW() - INTERVAL '20 hours'),
    (post5_id, sample_user_id, sample_user_id, 60, 'Amazing artistic process!', NOW() - INTERVAL '2 days'),
    (post8_id, sample_user_id, sample_user_id, 35, 'Love learning about your process', NOW() - INTERVAL '20 hours');
  END IF;
END $$;