# Supabase Database Setup for Blockchain Proofs

## Issue
The `proofs` table for blockchain content verification doesn't exist in your Supabase project. This causes "relation 'public.proofs' does not exist" errors.

## Solution 1: Manual Table Creation via Supabase Dashboard

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** tab
3. Copy and paste the following SQL code and run it:

```sql
-- Create proofs table for blockchain content verification
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

-- Create indexes for better performance
CREATE INDEX idx_proofs_user_id ON public.proofs(user_id);
CREATE INDEX idx_proofs_content_id ON public.proofs(content_id);
CREATE INDEX idx_proofs_file_hash ON public.proofs(file_hash);
CREATE INDEX idx_proofs_txn_id ON public.proofs(algorand_txn_id);
CREATE INDEX idx_proofs_created_at ON public.proofs(created_at);

-- Enable Row Level Security
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (ownership verification)
CREATE POLICY "Anyone can view proofs for verification" ON public.proofs
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own proofs" ON public.proofs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proofs" ON public.proofs
    FOR UPDATE USING (auth.uid() = user_id);

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
```

## Solution 2: Check Supabase Project Settings

If the above doesn't work, check these:

1. **API Settings**: Go to Settings > API and ensure the REST API is enabled
2. **Database**: Go to Database > Tables and verify the `proofs` table appears
3. **RLS Policies**: Go to Authentication > Policies and verify the policies exist

## Verification

After creating the table, test the ownership verification feature:

1. Go to the Dashboard > Ownership Demo page
2. Try uploading a file
3. The error should be resolved and ownership checking should work

## Temporary Workaround

The app has been updated to gracefully handle the missing table:
- It will show a warning in the console but continue to work
- Blockchain registration will still work (just not database storage)
- Ownership verification will be disabled but uploads will be allowed

## Migration Files

The proper migration file is located at:
`supabase/migrations/20250629210000_blockchain_proofs.sql`

This should have been applied automatically, but if it wasn't, the manual creation above will achieve the same result.
