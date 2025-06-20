/*
  # Create Audio Posts Tables

  1. New Tables
    - `audio_posts` table for storing audio content
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, audio title)
      - `description` (text, audio description)
      - `tags` (text array, content tags)
      - `audio_url` (text, stored audio file URL)
      - `script` (text, original script for AI-generated content)
      - `voice_id` (text, ElevenLabs voice ID used)
      - `generation_type` (text, 'ai' or 'upload')
      - `version` (integer, version number for iterations)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `audio_threads` table for feedback and iteration tracking
      - `id` (uuid, primary key)
      - `audio_post_id` (uuid, foreign key to audio_posts)
      - `user_id` (uuid, foreign key to users)
      - `message` (text, feedback message)
      - `message_type` (text, type of message)
      - `created_at` (timestamptz)

    - `audio_versions` table for tracking different versions
      - `id` (uuid, primary key)
      - `audio_post_id` (uuid, foreign key to audio_posts)
      - `version_number` (integer, version number)
      - `audio_url` (text, version-specific audio URL)
      - `script` (text, version-specific script)
      - `voice_id` (text, version-specific voice)
      - `changes_description` (text, what changed in this version)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own audio content
    - Add storage bucket for audio files
*/

-- Create audio_posts table
CREATE TABLE IF NOT EXISTS audio_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  audio_url text NOT NULL,
  script text,
  voice_id text,
  generation_type text NOT NULL CHECK (generation_type IN ('ai', 'upload')),
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audio_threads table
CREATE TABLE IF NOT EXISTS audio_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_post_id uuid REFERENCES audio_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('user_feedback', 'regeneration_request', 'system_response')),
  created_at timestamptz DEFAULT now()
);

-- Create audio_versions table
CREATE TABLE IF NOT EXISTS audio_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_post_id uuid REFERENCES audio_posts(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  audio_url text NOT NULL,
  script text,
  voice_id text,
  changes_description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE audio_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for audio_posts
CREATE POLICY "Users can view their own audio posts"
  ON audio_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio posts"
  ON audio_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio posts"
  ON audio_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio posts"
  ON audio_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for audio_threads
CREATE POLICY "Users can view threads for their audio posts"
  ON audio_threads
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM audio_posts WHERE id = audio_threads.audio_post_id
    )
  );

CREATE POLICY "Users can insert threads for their audio posts"
  ON audio_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id FROM audio_posts WHERE id = audio_threads.audio_post_id
    )
  );

-- Create policies for audio_versions
CREATE POLICY "Users can view versions of their audio posts"
  ON audio_versions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM audio_posts WHERE id = audio_versions.audio_post_id
    )
  );

CREATE POLICY "Users can insert versions for their audio posts"
  ON audio_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM audio_posts WHERE id = audio_versions.audio_post_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audio_posts_user_id ON audio_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_posts_created_at ON audio_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_threads_audio_post_id ON audio_threads(audio_post_id);
CREATE INDEX IF NOT EXISTS idx_audio_versions_audio_post_id ON audio_versions(audio_post_id);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-posts', 'audio-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own audio files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own audio files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'audio-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'audio-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for audio_posts updated_at
CREATE TRIGGER update_audio_posts_updated_at
  BEFORE UPDATE ON audio_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();