/*
  # Fix proofs table

  1. New Tables
    - No new tables created
  2. Security
    - Add public access policy for proofs verification
  3. Changes
    - Fix RLS policies for proofs table
*/

-- This migration fixes the proofs table policies to allow public verification

-- First check if the proofs table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proofs') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own proofs" ON public.proofs;
    DROP POLICY IF EXISTS "Public ownership verification" ON public.proofs;
    
    -- Create new policies
    -- Allow public access for verification purposes
    CREATE POLICY "Public ownership verification" ON public.proofs
      FOR SELECT USING (true);
      
    -- Allow users to create their own proofs
    CREATE POLICY "Users can create their own proofs" ON public.proofs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    -- Allow users to update their own proofs
    CREATE POLICY "Users can update their own proofs" ON public.proofs
      FOR UPDATE USING (auth.uid() = user_id);
      
    -- Allow users to delete their own proofs
    CREATE POLICY "Users can delete their own proofs" ON public.proofs
      FOR DELETE USING (auth.uid() = user_id);
      
    RAISE NOTICE 'Proofs table policies updated successfully';
  ELSE
    RAISE NOTICE 'Proofs table does not exist, creating it';
    
    -- Create the proofs table
    CREATE TABLE public.proofs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      content_id UUID NULL,
      content_type VARCHAR(50) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      file_hash VARCHAR(64) NOT NULL UNIQUE,
      file_size BIGINT,
      algorand_txn_id VARCHAR(100) NOT NULL UNIQUE,
      algorand_explorer_url TEXT,
      verification_status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX idx_proofs_user_id ON public.proofs(user_id);
    CREATE INDEX idx_proofs_content_id ON public.proofs(content_id);
    CREATE INDEX idx_proofs_file_hash ON public.proofs(file_hash);
    CREATE INDEX idx_proofs_txn_id ON public.proofs(algorand_txn_id);
    CREATE INDEX idx_proofs_created_at ON public.proofs(created_at);
    
    -- Enable RLS
    ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Public ownership verification" ON public.proofs
      FOR SELECT USING (true);
      
    CREATE POLICY "Users can create their own proofs" ON public.proofs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own proofs" ON public.proofs
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can delete their own proofs" ON public.proofs
      FOR DELETE USING (auth.uid() = user_id);
      
    -- Create updated_at trigger function if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
      CREATE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    END IF;
    
    -- Create trigger
    CREATE TRIGGER update_proofs_updated_at 
      BEFORE UPDATE ON public.proofs 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;