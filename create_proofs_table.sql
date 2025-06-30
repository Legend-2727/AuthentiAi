-- Manual creation of proofs table for blockchain content verification
-- Run this in the Supabase SQL Editor if the migration hasn't been applied

-- Drop table if exists (for clean creation)
DROP TABLE IF EXISTS public.proofs CASCADE;

-- Create proofs table for blockchain content verification
CREATE TABLE public.proofs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID NULL, -- Reference to videos/audio_posts/other content
    content_type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'image', etc.
    filename VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash
    file_size BIGINT,
    algorand_txn_id VARCHAR(100) NOT NULL UNIQUE,
    algorand_explorer_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_proofs_user_id ON public.proofs(user_id);
CREATE INDEX idx_proofs_content_id ON public.proofs(content_id);
CREATE INDEX idx_proofs_file_hash ON public.proofs(file_hash);
CREATE INDEX idx_proofs_txn_id ON public.proofs(algorand_txn_id);
CREATE INDEX idx_proofs_created_at ON public.proofs(created_at);

-- Enable Row Level Security
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is for ownership verification)
-- Allow anyone to read proofs for verification purposes
CREATE POLICY "Anyone can view proofs for verification" ON public.proofs
    FOR SELECT USING (true);

-- Users can only create proofs for themselves
CREATE POLICY "Users can create their own proofs" ON public.proofs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own proofs
CREATE POLICY "Users can update their own proofs" ON public.proofs
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own proofs
CREATE POLICY "Users can delete their own proofs" ON public.proofs
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proofs_updated_at 
    BEFORE UPDATE ON public.proofs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test record to verify the table works
-- (This will be removed after testing)
-- INSERT INTO public.proofs (
--     user_id, 
--     content_type, 
--     filename, 
--     file_hash, 
--     algorand_txn_id, 
--     verification_status
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000'::uuid,
--     'test',
--     'test.txt',
--     'test_hash_123',
--     'test_txn_123',
--     'confirmed'
-- );
