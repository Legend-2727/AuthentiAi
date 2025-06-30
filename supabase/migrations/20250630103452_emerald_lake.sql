/*
  # Star Sharing System

  1. New Tables
    - `shared_posts` - Tracks shared content with original creator reference
  
  2. Functions
    - `process_star_split()` - Handles 80/20 split between original creator and sharer
  
  3. Triggers
    - Automatically processes star splits when transactions are created
*/

-- Create shared_posts table to track shared content
CREATE TABLE IF NOT EXISTS public.shared_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id UUID NOT NULL,
  shared_post_id UUID NOT NULL,
  original_creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sharer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure original creator and sharer are different users
  CONSTRAINT different_users CHECK (original_creator_id <> sharer_id),
  
  -- Ensure original and shared posts are different
  CONSTRAINT different_posts CHECK (original_post_id <> shared_post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_posts_original_post ON public.shared_posts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_shared_posts_shared_post ON public.shared_posts(shared_post_id);
CREATE INDEX IF NOT EXISTS idx_shared_posts_original_creator ON public.shared_posts(original_creator_id);
CREATE INDEX IF NOT EXISTS idx_shared_posts_sharer ON public.shared_posts(sharer_id);

-- Enable RLS
ALTER TABLE public.shared_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view shared posts" ON public.shared_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can share posts" ON public.shared_posts
  FOR INSERT WITH CHECK (auth.uid() = sharer_id);

-- Create function to process star split (80/20)
CREATE OR REPLACE FUNCTION process_star_split()
RETURNS TRIGGER AS $$
DECLARE
  shared_record RECORD;
  creator_stars INTEGER;
  sharer_stars INTEGER;
  creator_transaction_id UUID;
  sharer_transaction_id UUID;
BEGIN
  -- Check if this is a transaction for a shared post
  SELECT * INTO shared_record
  FROM public.shared_posts
  WHERE shared_post_id = NEW.content_id;
  
  -- If this is a shared post, split the stars
  IF FOUND THEN
    -- Calculate the split (80% to creator, 20% to sharer)
    creator_stars := FLOOR(NEW.stars_given * 0.8);
    sharer_stars := NEW.stars_given - creator_stars;
    
    -- Create transaction for original creator (80%)
    INSERT INTO public.star_transactions (
      from_user_id,
      to_user_id,
      content_id,
      content_type,
      stars_given,
      message
    ) VALUES (
      NEW.from_user_id,
      shared_record.original_creator_id,
      shared_record.original_post_id,
      NEW.content_type,
      creator_stars,
      COALESCE(NEW.message, '') || ' (80% creator share)'
    )
    RETURNING id INTO creator_transaction_id;
    
    -- Create transaction for sharer (20%)
    INSERT INTO public.star_transactions (
      from_user_id,
      to_user_id,
      content_id,
      content_type,
      stars_given,
      message
    ) VALUES (
      NEW.from_user_id,
      shared_record.sharer_id,
      NEW.content_id,
      NEW.content_type,
      sharer_stars,
      COALESCE(NEW.message, '') || ' (20% sharer share)'
    )
    RETURNING id INTO sharer_transaction_id;
    
    -- Update star balances for both users
    -- For creator
    UPDATE public.star_balances
    SET balance = balance + creator_stars
    WHERE user_id = shared_record.original_creator_id;
    
    -- For sharer
    UPDATE public.star_balances
    SET balance = balance + sharer_stars
    WHERE user_id = shared_record.sharer_id;
    
    -- Return NULL to prevent the original transaction from being created
    -- since we've created two separate transactions instead
    RETURN NULL;
  END IF;
  
  -- If not a shared post, proceed with the original transaction
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to process star splits
DO $$
BEGIN
  -- Only create the trigger if the star_transactions table exists
  IF EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'star_transactions'
  ) THEN
    -- Drop the trigger if it already exists
    DROP TRIGGER IF EXISTS process_star_split_trigger ON public.star_transactions;
    
    -- Create the trigger
    CREATE TRIGGER process_star_split_trigger
      BEFORE INSERT ON public.star_transactions
      FOR EACH ROW
      EXECUTE FUNCTION process_star_split();
  END IF;
END $$;

-- Add a view to show earnings with split information
CREATE OR REPLACE VIEW public.creator_earnings AS
SELECT
  u.id AS user_id,
  u.username,
  u.email,
  COALESCE(SUM(st.stars_given), 0) AS total_stars_earned,
  COALESCE(SUM(st.stars_given) FILTER (WHERE st.message LIKE '%creator share%'), 0) AS creator_share_stars,
  COALESCE(SUM(st.stars_given) FILTER (WHERE st.message LIKE '%sharer share%'), 0) AS sharer_share_stars,
  COALESCE(SUM(st.stars_given) FILTER (WHERE st.message NOT LIKE '%share%'), 0) AS direct_stars,
  COALESCE(SUM(st.stars_given) * 0.01, 0) AS dollar_value
FROM
  public.users u
LEFT JOIN
  public.star_transactions st ON u.id = st.to_user_id
GROUP BY
  u.id, u.username, u.email;

-- Grant permissions
ALTER TABLE public.shared_posts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.shared_posts TO authenticated;
GRANT SELECT ON public.shared_posts TO anon;
GRANT SELECT ON public.creator_earnings TO authenticated;