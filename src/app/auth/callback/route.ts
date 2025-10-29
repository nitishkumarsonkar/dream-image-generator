import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors (e.g., user cancellation)
    if (error) {
      console.error('OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
      )
    }

    // Handle authorization code exchange
    if (code) {
      const supabase = await createClient()
      
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(
          `${origin}/auth/error?error=session_exchange_failed&description=${encodeURIComponent(exchangeError.message)}`
        )
      }

      // Successful authentication
      if (data.session) {
        console.log('Authentication successful for user:', data.user?.email)
        
        // Clean redirect URL (remove any hash fragments)
        const cleanNext = next.split('#')[0]
        
        return NextResponse.redirect(`${origin}${cleanNext}`)
      }
    }

    // No code parameter - likely a direct access
    console.warn('Auth callback accessed without code parameter')
    return NextResponse.redirect(`${origin}/auth/error?error=missing_code&description=Authentication code not found`)
    
  } catch (err) {
    console.error('Auth callback error:', err)
    return NextResponse.redirect(`${origin}/auth/error?error=unexpected_error&description=An unexpected error occurred`)
  }
}
