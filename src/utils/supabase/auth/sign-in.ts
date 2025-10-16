import { createClient } from '@/utils/supabase/client'

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  return { data, error }
}

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createClient()
  
  // Get the site URL from environment or use current origin as fallback
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  return { data, error }
}
