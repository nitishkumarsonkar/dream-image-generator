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
import { logError, logInfo, logUserAction, logCreditOperation, logWarn } from '@/lib/logger';

// Tell Next.js this is a dynamic route (not static)
export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/razorpay/verify-payment
 * Verifies Razorpay payment and adds credits to user account
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
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
      logWarn('Payment verification attempted with missing details', {
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature,
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { error: 'Missing payment verification details' },
        { status: 400 }
      );
    }

    if (!credits || !amount || !packageId) {
      logWarn('Payment verification attempted with missing credit details', {
        hasCredits: !!credits,
        hasAmount: !!amount,
        hasPackageId: !!packageId,
        orderId: razorpay_order_id
      });
      return NextResponse.json(
        { error: 'Missing credit details' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logWarn('Unauthorized payment verification attempt', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        authError: authError?.message,
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Verify payment signature
    // This ensures the payment is genuine and hasn't been tampered with
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      logError('Payment signature verification failed', new Error('Invalid signature'), user.id, {
        component: 'payment-verification',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        expectedSignature: generatedSignature.slice(0, 10) + '...',
        receivedSignature: razorpay_signature.slice(0, 10) + '...'
      });
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }

    logUserAction('payment_signature_verified', user.id, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount,
      credits
    });

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

      logCreditOperation('add', user.id, credits, newBalance);

      const duration = Date.now() - startTime;
      logInfo('Payment verified and credits added successfully', {
        userId: user.id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        creditsAdded: credits,
        amountPaid: amount,
        newBalance,
        duration
      });

      // Return success response
      return NextResponse.json({
        success: true,
        message: `Successfully added ${credits} credits to your account`,
        newBalance,
        credits,
      });

    } catch (creditError: any) {
      logError('Failed to add credits after successful payment', creditError, user.id, {
        component: 'credit-system',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        creditsToAdd: credits,
        amountPaid: amount
      });
      
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
    logError('Payment verification API error', error, userId, {
      component: 'payment-verification',
      endpoint: '/api/payment/razorpay/verify-payment',
      method: 'POST',
      duration: Date.now() - startTime
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
