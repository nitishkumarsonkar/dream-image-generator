// Re-export canonical server client to avoid duplication and drift.
// Use this path in App Router server code if preferred: '@/app/utils/supabase/server'
export { createClient } from '@/utils/supabase/server'
