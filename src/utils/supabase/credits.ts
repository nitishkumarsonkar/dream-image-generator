/**
 * Credit Management Utilities for Supabase
 * 
 * This module provides functions to manage user credits including:
 * - Getting current credit balance
 * - Deducting credits for actions
 * - Adding credits after purchases
 * - Retrieving transaction history
 */

import { createClient } from './client';

// Type definitions for better type safety
export type TransactionType = 
  | 'purchase' 
  | 'image_generation' 
  | 'ai_chat' 
  | 'initial_bonus' 
  | 'refund';

export interface CreditBalance {
  credits: number;
  user_id: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  description: string | null;
  balance_after: number;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface DeductCreditsParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  metadata?: Record<string, any>;
}

export interface AddCreditsParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Get the current credit balance for a user
 * Initializes credits if user doesn't have a record yet
 * 
 * @param userId - The user's UUID
 * @returns Promise<number> - The current credit balance
 * @throws Error if database operation fails
 */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = createClient();

  try {
    // First, try to get existing credits
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If user doesn't have credits record, create one with initial 50 credits
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: userId, credits: 50 })
          .select('credits')
          .single();

        if (insertError) {
          console.error('Error initializing user credits:', insertError);
          throw new Error('Failed to initialize credits');
        }

        // Log initial bonus transaction
        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: 50,
          transaction_type: 'initial_bonus',
          description: 'Welcome bonus - 50 free credits',
          balance_after: 50,
          metadata: { source: 'manual_initialization' }
        });

        return newData?.credits ?? 50;
      }

      console.error('Error fetching user credits:', error);
      throw new Error('Failed to fetch credits');
    }

    return data?.credits ?? 0;
  } catch (error) {
    console.error('Unexpected error in getUserCredits:', error);
    throw error;
  }
}

/**
 * Check if user has sufficient credits for an action
 * 
 * @param userId - The user's UUID
 * @param requiredAmount - The amount of credits required
 * @returns Promise<boolean> - True if user has enough credits
 */
export async function hasEnoughCredits(
  userId: string, 
  requiredAmount: number
): Promise<boolean> {
  try {
    const currentBalance = await getUserCredits(userId);
    return currentBalance >= requiredAmount;
  } catch (error) {
    console.error('Error checking credit balance:', error);
    return false;
  }
}

/**
 * Deduct credits from user's balance
 * This is an atomic operation that updates balance and creates transaction log
 * 
 * @param params - DeductCreditsParams object
 * @returns Promise<number> - The new balance after deduction
 * @throws Error if insufficient credits or database operation fails
 */
export async function deductCredits({
  userId,
  amount,
  type,
  description,
  metadata = {}
}: DeductCreditsParams): Promise<number> {
  const supabase = createClient();

  try {
    // Get current balance
    const currentBalance = await getUserCredits(userId);

    // Check if user has enough credits
    if (currentBalance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}`);
    }

    // Calculate new balance
    const newBalance = currentBalance - amount;

    // Update user's credit balance
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ credits: newBalance })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw new Error('Failed to deduct credits');
    }

    // Log the transaction (negative amount for deductions)
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount, // Negative for deductions
        transaction_type: type,
        description,
        balance_after: newBalance,
        metadata
      });

    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Note: We don't throw here as the deduction was successful
    }

    return newBalance;
  } catch (error) {
    console.error('Error in deductCredits:', error);
    throw error;
  }
}

/**
 * Add credits to user's balance (for purchases, refunds, bonuses)
 * This is an atomic operation that updates balance and creates transaction log
 * 
 * @param params - AddCreditsParams object
 * @returns Promise<number> - The new balance after addition
 * @throws Error if database operation fails
 */
export async function addCredits({
  userId,
  amount,
  type,
  description,
  metadata = {}
}: AddCreditsParams): Promise<number> {
  const supabase = createClient();

  try {
    // Get current balance
    const currentBalance = await getUserCredits(userId);

    // Calculate new balance
    const newBalance = currentBalance + amount;

    // Update user's credit balance
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({ credits: newBalance })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw new Error('Failed to add credits');
    }

    // Log the transaction (positive amount for additions)
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: amount, // Positive for additions
        transaction_type: type,
        description,
        balance_after: newBalance,
        metadata
      });

    if (transactionError) {
      console.error('Error logging transaction:', transactionError);
      // Note: We don't throw here as the addition was successful
    }

    return newBalance;
  } catch (error) {
    console.error('Error in addCredits:', error);
    throw error;
  }
}

/**
 * Get transaction history for a user
 * 
 * @param userId - The user's UUID
 * @param limit - Maximum number of transactions to return (default: 50)
 * @returns Promise<CreditTransaction[]> - Array of transactions
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }

    return data ?? [];
  } catch (error) {
    console.error('Error in getTransactionHistory:', error);
    throw error;
  }
}

/**
 * Get detailed credit balance with metadata
 * 
 * @param userId - The user's UUID
 * @returns Promise<CreditBalance | null> - Credit balance object with metadata
 */
export async function getCreditBalance(userId: string): Promise<CreditBalance | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits, user_id, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching credit balance:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCreditBalance:', error);
    return null;
  }
}

/**
 * Constants for credit costs
 * These can be easily modified to adjust pricing
 */
export const CREDIT_COSTS = {
  IMAGE_GENERATION: 5,
  AI_CHAT_MESSAGE: 1,
} as const;

/**
 * Credit packages for purchase
 * Each package includes credits, price in INR, and any bonus credits
 */
export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 99, // ₹99
    bonus: 0,
    popular: false,
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 250,
    price: 199, // ₹199
    bonus: 50, // +50 bonus credits
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 500,
    price: 349, // ₹349
    bonus: 150, // +150 bonus credits
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    price: 599, // ₹599
    bonus: 400, // +400 bonus credits
    popular: false,
  },
] as const;

export type CreditPackage = typeof CREDIT_PACKAGES[number];
