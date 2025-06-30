-- Migration to create video storage bucket and policies
-- This should be run in Supabase to enable video file uploads

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for training videos (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-videos', 'training-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for video storage bucket
CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to read video files (since they are shared content)
CREATE POLICY "Anyone can view videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Policies for training videos (private bucket)
CREATE POLICY "Users can upload their training videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'training-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their training videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'training-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their training videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'training-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
