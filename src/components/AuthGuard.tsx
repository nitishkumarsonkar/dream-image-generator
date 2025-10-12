'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/utils/supabase/auth/user'
import { useRouter } from 'next/navigation'
import { AuthGuardProps, AppUser } from '../types'

export default function AuthGuard({ children }: AuthGuardProps) {
  const [user, setUser] = useState<AppUser>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (!currentUser) {
          router.push('/sign-in')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/sign-in')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to sign-in
  }

  return <>{children}</>
}
