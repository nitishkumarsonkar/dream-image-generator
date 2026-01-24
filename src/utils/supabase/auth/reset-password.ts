import { createClient } from '@/utils/supabase/client'

export async function sendPasswordReset(email: string) {
  const supabase = createClient()

  // Use Supabase auth method to send a password reset email.
  // `resetPasswordForEmail` is the v2 client helper that sends the reset link.
  // Provide a redirect URL back to the app after password change if available.
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  })

  return { data, error }
}
