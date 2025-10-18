/**
 * Razorpay Payment API - Create Order
 * 
 * POST /api/payment/razorpay/create-order
 * 
 * This endpoint creates a Razorpay order for purchasing credits.
 * It validates the request, creates an order, and returns order details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logError, logInfo, logUserAction, logWarn } from '@/lib/logger';

// Tell Next.js this is a dynamic route (not static)
export const dynamic = 'force-dynamic';

/**
 * Get Razorpay instance
 * Initialized lazily to avoid build-time errors on Vercel
 */
function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * POST /api/payment/razorpay/create-order
 * Creates a new Razorpay order for credit purchase
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // Parse request body
    const body = await request.json();
    const { amount, credits, packageId } = body;

    // Validate required fields
    if (!amount || !credits || !packageId) {
      logWarn('Payment order creation attempted with missing fields', {
        hasAmount: !!amount,
        hasCredits: !!credits,
        hasPackageId: !!packageId,
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { error: 'Missing required fields: amount, credits, packageId' },
        { status: 400 }
      );
    }

    // Validate amount (must be positive)
    if (amount <= 0) {
      logWarn('Payment order creation attempted with invalid amount', {
        amount,
        credits,
        packageId
      });
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate credits (must be positive)
    if (credits <= 0) {
      logWarn('Payment order creation attempted with invalid credits', {
        amount,
        credits,
        packageId
      });
      return NextResponse.json(
        { error: 'Credits must be greater than 0' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logWarn('Unauthorized payment order creation attempt', {
        authError: authError?.message,
        amount,
        credits,
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();

    // Create Razorpay order
    // Amount should be in paise (smallest currency unit)
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert rupees to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        credits: credits.toString(),
        packageId: packageId,
        userEmail: user.email || '',
      },
    });

    logUserAction('payment_order_created', user.id, {
      orderId: razorpayOrder.id,
      amount,
      credits,
      packageId,
      currency: razorpayOrder.currency
    });

    const duration = Date.now() - startTime;
    logInfo('Payment order created successfully', {
      userId: user.id,
      orderId: razorpayOrder.id,
      amount,
      credits,
      packageId,
      duration
    });

    // Return order details to client
    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Client needs this for checkout
    });

  } catch (error: any) {
    logError('Failed to create payment order', error, userId, {
      component: 'payment-order-creation',
      endpoint: '/api/payment/razorpay/create-order',
      method: 'POST',
      duration: Date.now() - startTime
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment order', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
