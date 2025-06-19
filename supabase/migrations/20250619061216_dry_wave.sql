/*
  # Add Profile and Videos Tables

  1. New Tables
    - Update `users` table to include profile fields
      - `name` (text, display name)
      - `profile_img_url` (text, profile image URL)
    - Create `videos` table
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, video title)
      - `script` (text, video script)
      - `video_url` (text, generated video URL)
      - `status` (text, video generation status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `videos` table
    - Add policies for users to manage their own videos
    - Update users table with new columns
*/

-- Add new columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_img_url'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_img_url text DEFAULT 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=random';
  END IF;
END $$;

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  script text NOT NULL,
  video_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies for videos table
CREATE POLICY "Users can view their own videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update users table policy to allow profile updates
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);