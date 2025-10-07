import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  return user
}

export async function updateUserProfile(updates: {
  full_name?: string
  avatar_url?: string
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  })

  return { data, error }
}
