-- Migration: Add Credits System
-- Description: Creates tables for user credits and transaction history with RLS policies

-- =====================================================
-- 1. CREATE USER_CREDITS TABLE
-- =====================================================
-- This table stores the current credit balance for each user
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 50, -- Initial free credits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One record per user
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);

-- Add check constraint to prevent negative credits
ALTER TABLE public.user_credits 
ADD CONSTRAINT credits_non_negative CHECK (credits >= 0);

-- =====================================================
-- 2. CREATE CREDIT_TRANSACTIONS TABLE
-- =====================================================
-- This table logs all credit transactions (additions and deductions)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for additions, negative for deductions
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'image_generation', 'ai_chat', 'initial_bonus', 'refund'
    description TEXT,
    balance_after INTEGER NOT NULL, -- Credit balance after this transaction
    metadata JSONB, -- Store additional data like payment_id, razorpay_order_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(transaction_type);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on user_credits table
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own credits
CREATE POLICY "Users can view own credits"
    ON public.user_credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own credits (through functions only)
CREATE POLICY "Users can update own credits"
    ON public.user_credits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own credits record
CREATE POLICY "Users can insert own credits"
    ON public.user_credits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Enable RLS on credit_transactions table
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transaction history
CREATE POLICY "Users can view own transactions"
    ON public.credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions (through functions only)
CREATE POLICY "Users can insert own transactions"
    ON public.credit_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function: Initialize credits for new user
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert initial 50 credits for new user
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (NEW.id, 50)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Log the initial bonus transaction
    INSERT INTO public.credit_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        balance_after,
        metadata
    )
    VALUES (
        NEW.id,
        50,
        'initial_bonus',
        'Welcome bonus - 50 free credits',
        50,
        jsonb_build_object('source', 'signup_bonus')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically initialize credits when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_initialize_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_initialize_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_credits();

-- Function: Update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on user_credits changes
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_credits TO authenticated;
GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- 1. user_credits table with 50 initial credits
-- 2. credit_transactions table for transaction history
-- 3. RLS policies for data security
-- 4. Auto-initialization trigger for new users
-- 5. Helper functions for credit management
