-- Star System Tables for Veridica Creator Economy
-- This migration adds tables for star balances, purchases, and transactions

-- Create star_balances table to track user star counts
CREATE TABLE IF NOT EXISTS star_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_star_balance UNIQUE(user_id)
);

-- Create star_purchases table to track RevenueCat purchases
CREATE TABLE IF NOT EXISTS star_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    revenuecat_transaction_id TEXT NOT NULL,
    package_identifier TEXT NOT NULL,
    stars_purchased INTEGER NOT NULL CHECK (stars_purchased > 0),
    amount_usd DECIMAL(10,2) NOT NULL CHECK (amount_usd > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    purchase_status TEXT NOT NULL DEFAULT 'completed' CHECK (purchase_status IN ('pending', 'completed', 'failed', 'refunded')),
    revenuecat_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_revenuecat_transaction UNIQUE(revenuecat_transaction_id)
);

-- Create star_transactions table to track star giving/receiving
CREATE TABLE IF NOT EXISTS star_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID, -- Can be NULL for direct tips
    content_type TEXT, -- 'video', 'audio', 'post', etc.
    stars_given INTEGER NOT NULL DEFAULT 1 CHECK (stars_given > 0),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT different_users CHECK (from_user_id != to_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_star_balances_user_id ON star_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_star_purchases_user_id ON star_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_star_purchases_status ON star_purchases(purchase_status);
CREATE INDEX IF NOT EXISTS idx_star_transactions_from_user ON star_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_star_transactions_to_user ON star_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_star_transactions_content ON star_transactions(content_id);

-- Create RLS policies for star_balances
ALTER TABLE star_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own star balance" ON star_balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own star balance" ON star_balances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert star balances" ON star_balances
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for star_purchases
ALTER TABLE star_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases" ON star_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert purchases" ON star_purchases
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for star_transactions
ALTER TABLE star_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions they sent" ON star_transactions
    FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Users can view transactions they received" ON star_transactions
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can create transactions" ON star_transactions
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Create function to automatically create star balance for new users
CREATE OR REPLACE FUNCTION create_star_balance_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO star_balances (user_id, balance)
    VALUES (NEW.id, 50) -- Give new users 50 stars to start
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create star balance for new users
DROP TRIGGER IF EXISTS on_auth_user_created_star_balance ON auth.users;
CREATE TRIGGER on_auth_user_created_star_balance
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_star_balance_for_user();

-- Create function to handle star transactions
CREATE OR REPLACE FUNCTION process_star_transaction(
    p_from_user_id UUID,
    p_to_user_id UUID,
    p_content_id UUID DEFAULT NULL,
    p_content_type TEXT DEFAULT NULL,
    p_stars_given INTEGER DEFAULT 1,
    p_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_from_balance INTEGER;
    v_to_balance INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Check if users are different
    IF p_from_user_id = p_to_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot send stars to yourself');
    END IF;

    -- Get current balance of sender
    SELECT balance INTO v_from_balance
    FROM star_balances
    WHERE user_id = p_from_user_id;

    -- Check if sender has enough stars
    IF v_from_balance IS NULL OR v_from_balance < p_stars_given THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient star balance');
    END IF;

    -- Deduct stars from sender
    UPDATE star_balances
    SET balance = balance - p_stars_given,
        updated_at = NOW()
    WHERE user_id = p_from_user_id;

    -- Add stars to receiver (create balance if doesn't exist)
    INSERT INTO star_balances (user_id, balance)
    VALUES (p_to_user_id, p_stars_given)
    ON CONFLICT (user_id)
    DO UPDATE SET 
        balance = star_balances.balance + p_stars_given,
        updated_at = NOW();

    -- Record the transaction
    INSERT INTO star_transactions (
        from_user_id, 
        to_user_id, 
        content_id, 
        content_type, 
        stars_given, 
        message
    )
    VALUES (
        p_from_user_id, 
        p_to_user_id, 
        p_content_id, 
        p_content_type, 
        p_stars_given, 
        p_message
    )
    RETURNING id INTO v_transaction_id;

    RETURN jsonb_build_object(
        'success', true, 
        'transaction_id', v_transaction_id,
        'stars_given', p_stars_given
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add stars from purchase
CREATE OR REPLACE FUNCTION add_stars_from_purchase(
    p_user_id UUID,
    p_stars_to_add INTEGER,
    p_revenuecat_transaction_id TEXT,
    p_package_identifier TEXT,
    p_amount_usd DECIMAL,
    p_revenuecat_data JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_purchase_id UUID;
BEGIN
    -- Record the purchase
    INSERT INTO star_purchases (
        user_id,
        revenuecat_transaction_id,
        package_identifier,
        stars_purchased,
        amount_usd,
        revenuecat_data
    )
    VALUES (
        p_user_id,
        p_revenuecat_transaction_id,
        p_package_identifier,
        p_stars_to_add,
        p_amount_usd,
        p_revenuecat_data
    )
    ON CONFLICT (revenuecat_transaction_id) DO NOTHING
    RETURNING id INTO v_purchase_id;

    -- Check if transaction was already processed
    IF v_purchase_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction already processed');
    END IF;

    -- Add stars to user balance
    INSERT INTO star_balances (user_id, balance)
    VALUES (p_user_id, p_stars_to_add)
    ON CONFLICT (user_id)
    DO UPDATE SET 
        balance = star_balances.balance + p_stars_to_add,
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true, 
        'purchase_id', v_purchase_id,
        'stars_added', p_stars_to_add
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
