/**
 * Razorpay Payment API - Verify Payment
 * 
 * POST /api/payment/razorpay/verify-payment
 * 
 * This endpoint verifies the Razorpay payment signature and credits the user's account.
 * It ensures payment authenticity before adding credits to prevent fraud.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { addCredits } from '@/utils/supabase/credits';
import crypto from 'crypto';

// Tell Next.js this is a dynamic route (not static)
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/razorpay/verify-payment
 * Verifies Razorpay payment and adds credits to user account
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      credits,
      amount,
      packageId 
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification details' },
        { status: 400 }
      );
    }

    if (!credits || !amount || !packageId) {
      return NextResponse.json(
        { error: 'Missing credit details' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify payment signature
    // This ensures the payment is genuine and hasn't been tampered with
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }

    // Signature is valid - add credits to user's account
    try {
      const newBalance = await addCredits({
        userId: user.id,
        amount: credits,
        type: 'purchase',
        description: `Purchased ${credits} credits via Razorpay`,
        metadata: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount_paid: amount,
          packageId,
          payment_method: 'razorpay',
        }
      }, supabase);

      // Return success response
      return NextResponse.json({
        success: true,
        message: `Successfully added ${credits} credits to your account`,
        newBalance,
        credits,
      });

    } catch (creditError: any) {
      console.error('Error adding credits:', creditError);
      
      // Payment was successful but credit addition failed
      // This should trigger a manual review/refund
      return NextResponse.json(
        { 
          error: 'Payment successful but failed to add credits. Please contact support.',
          paymentId: razorpay_payment_id,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
