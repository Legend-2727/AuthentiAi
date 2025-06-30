-- Create proofs table for blockchain content verification
CREATE TABLE IF NOT EXISTS public.proofs (
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
CREATE INDEX IF NOT EXISTS idx_proofs_user_id ON public.proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_proofs_content_id ON public.proofs(content_id);
CREATE INDEX IF NOT EXISTS idx_proofs_file_hash ON public.proofs(file_hash);
CREATE INDEX IF NOT EXISTS idx_proofs_txn_id ON public.proofs(algorand_txn_id);
CREATE INDEX IF NOT EXISTS idx_proofs_created_at ON public.proofs(created_at);

-- Enable Row Level Security
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own proofs" ON public.proofs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proofs" ON public.proofs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proofs" ON public.proofs
    FOR UPDATE USING (auth.uid() = user_id);

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

-- Grant permissions
GRANT ALL ON public.proofs TO authenticated;
GRANT ALL ON public.proofs TO service_role;
