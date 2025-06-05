/*
  # Create users table

  1. New Tables
    - `users` table with user profile information
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `created_at` (timestamptz)
      - `status` (text)
  
  2. Security
    - Enable RLS on `users` table
    - Add policies for users to manage their own data
*/

-- Create a table for user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" 
  ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "New users can insert their profile"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);