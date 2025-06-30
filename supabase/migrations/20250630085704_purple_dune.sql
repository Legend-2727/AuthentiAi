-- This migration fixes the proofs table policies to allow public verification

-- Check if the proofs table exists
CREATE OR REPLACE FUNCTION temp_check_proofs_table()
RETURNS void AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proofs'
  ) INTO table_exists;
  
  IF table_exists THEN
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
      
    RAISE NOTICE 'Proofs table created successfully';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to check and create/update the proofs table
SELECT temp_check_proofs_table();

-- Create trigger if the table exists and the trigger doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proofs'
  ) AND NOT EXISTS (
    SELECT FROM pg_trigger WHERE tgname = 'update_proofs_updated_at'
  ) THEN
    CREATE TRIGGER update_proofs_updated_at 
      BEFORE UPDATE ON public.proofs 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Clean up the temporary function
DROP FUNCTION temp_check_proofs_table();