'use client'

import React, { useState } from 'react'
import { sendPasswordReset } from '@/utils/supabase/auth/reset-password'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await sendPasswordReset(email)
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('If an account exists for that email, a password reset link has been sent.')
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Reset your password</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Enter the email associated with your account and we'll send a reset link.</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {message && (
              <div className={`text-sm font-medium p-3 rounded-lg ${message.includes('error') || message.includes('Error') ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? 'Sending...' : 'Send reset email'}
            </button>
          </form>

          <div className="text-center text-sm">
            <button onClick={() => router.push('/sign-in')} className="font-medium text-primary-600 hover:underline">Back to sign in</button>
          </div>
        </div>
      </div>
    </main>
  )
}
