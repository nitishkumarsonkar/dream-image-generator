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

export async function getLibraryItemWithImages(id: string) {
  const supabase = createClient()
  
  // Get the library item
  const { data: libraryItem, error: libraryError } = await supabase
    .from('prompt_library')
    .select('*')
    .eq('id', id)
    .single()

  if (libraryError || !libraryItem) {
    return { data: null, error: libraryError }
  }

  // If no source prompt, return just the library item
  if (!libraryItem.source_prompt_id) {
    return { 
      data: { 
        ...libraryItem, 
        images: { inputs: [], outputs: [] } 
      }, 
      error: null 
    }
  }

  // Get images from the source prompt
  const { data: images, error: imagesError } = await supabase
    .from('prompt_images')
    .select('image_url, image_type')
    .eq('prompt_id', libraryItem.source_prompt_id)

  if (imagesError) {
    return { data: null, error: imagesError }
  }

  const inputs = (images || []).filter(img => img.image_type === 'input').map(img => img.image_url)
  const outputs = (images || []).filter(img => img.image_type === 'output').map(img => img.image_url)

  return { 
    data: { 
      ...libraryItem, 
      images: { inputs, outputs } 
    }, 
    error: null 
  }
}

export async function getUserLikes() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('prompt_library_likes')
    .select('prompt_library_id')
  
  if (error) {
    return { data: null, error }
  }
  
  const likedIds = new Set(data?.map(like => like.prompt_library_id) || [])
  return { data: likedIds, error: null }
}

export async function toggleLike(promptLibraryId: string) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: userError || new Error('User not authenticated') }
  }
  
  // Check if user already liked this prompt
  const { data: existingLike, error: checkError } = await supabase
    .from('prompt_library_likes')
    .select('id')
    .eq('prompt_library_id', promptLibraryId)
    .eq('user_id', user.id)
    .single()
  
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
    return { error: checkError }
  }
  
  if (existingLike) {
    // Unlike: delete the like and decrement count
    const { error: deleteError } = await supabase
      .from('prompt_library_likes')
      .delete()
      .eq('id', existingLike.id)
    
    if (deleteError) {
      return { error: deleteError }
    }
    
    // Decrement like_count - get current count first
    const { data: currentPrompt, error: fetchError } = await supabase
      .from('prompt_library')
      .select('like_count')
      .eq('id', promptLibraryId)
      .single()
    
    if (fetchError) {
      return { error: fetchError }
    }
    
    const { error: updateError } = await supabase
      .from('prompt_library')
      .update({ like_count: Math.max(0, (currentPrompt.like_count || 0) - 1) })
      .eq('id', promptLibraryId)
    
    return { error: updateError }
  } else {
    // Like: insert the like and increment count
    const { error: insertError } = await supabase
      .from('prompt_library_likes')
      .insert({ 
        prompt_library_id: promptLibraryId,
        user_id: user.id
      })
    
    if (insertError) {
      return { error: insertError }
    }
    
    // Increment like_count - get current count first
    const { data: currentPrompt, error: fetchError } = await supabase
      .from('prompt_library')
      .select('like_count')
      .eq('id', promptLibraryId)
      .single()
    
    if (fetchError) {
      return { error: fetchError }
    }
    
    const { error: updateError } = await supabase
      .from('prompt_library')
      .update({ like_count: (currentPrompt.like_count || 0) + 1 })
      .eq('id', promptLibraryId)
    
    return { error: updateError }
  }
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
