import { NextResponse } from 'next/server';
import { logInfo } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  logInfo('Environment test endpoint accessed', {
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
    hasRazorpayCredentials: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'missing',
    hasPublishableKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
    hasRazorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
    hasRazorpaySecret: !!process.env.RAZORPAY_KEY_SECRET,
  });
}
