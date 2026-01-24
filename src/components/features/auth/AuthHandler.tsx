'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if URL contains auth tokens in hash
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash
        
        if (hash.includes('access_token') || hash.includes('refresh_token')) {
          try {
            // Let Supabase handle the session from URL hash
            const { data, error } = await supabase.auth.getSession()
            
            if (error) {
              console.error('Error getting session from hash:', error)
            } else if (data.session) {
              console.log('Session established from URL hash')
            }
            
            // Clean up the URL by removing hash parameters
            const cleanUrl = window.location.pathname + window.location.search
            window.history.replaceState({}, document.title, cleanUrl)
            
            // Redirect to home if we're on the root path
            if (pathname === '/') {
              router.refresh()
            }
          } catch (err) {
            console.error('Error handling auth callback:', err)
          }
        }
      }
    }

    // Handle initial page load
    handleAuthCallback()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.email)
        
        // Clean up URL if it contains auth tokens
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          const cleanUrl = window.location.pathname + window.location.search
          window.history.replaceState({}, document.title, cleanUrl)
        }
        
        // Refresh the page to update auth state
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        router.refresh()
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Auth token refreshed')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname, supabase.auth])

  return null
}