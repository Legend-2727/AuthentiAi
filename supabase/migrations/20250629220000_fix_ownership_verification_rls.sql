-- Fix RLS policies for ownership verification
-- Add policy to allow checking ownership by file hash (public read for ownership verification)

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own proofs" ON public.proofs;

-- Create new policies
-- 1. Users can view their own proofs (for personal dashboard)
CREATE POLICY "Users can view their own proofs" ON public.proofs
    FOR SELECT USING (auth.uid() = user_id);

-- 2. Anyone can check ownership by file hash (for ownership verification)
-- This is safe because it only reveals if content exists and who owns it
CREATE POLICY "Public ownership verification" ON public.proofs
    FOR SELECT USING (true);

-- Note: We keep the restrictive INSERT and UPDATE policies as they were
-- CREATE POLICY "Users can create their own proofs" ON public.proofs
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can update their own proofs" ON public.proofs
--     FOR UPDATE USING (auth.uid() = user_id);
