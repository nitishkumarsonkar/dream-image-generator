import { createClient } from '@/utils/supabase/client'
import { Database } from '@/utils/supabase/types'

type PromptLibrary = Database['public']['Tables']['prompt_library']['Row']
type PromptLibraryInsert = Database['public']['Tables']['prompt_library']['Insert']
type PromptLibraryUpdate = Database['public']['Tables']['prompt_library']['Update']

// Client-side functions
export async function getPromptLibrary(userId?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('prompt_library')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    // Get public prompts
    query = query.eq('is_public', true)
  }

  const { data, error } = await query

  return { data, error }
}

export async function savePrompt(prompt: Omit<PromptLibraryInsert, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('prompt_library')
    .insert({
      ...prompt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

export async function updatePrompt(id: string, updates: Omit<PromptLibraryUpdate, 'id' | 'user_id' | 'created_at'>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('prompt_library')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function deletePrompt(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('prompt_library')
    .delete()
    .eq('id', id)

  return { error }
}
