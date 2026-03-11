'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentSession, updateSessionActivity, endSession } from '@/lib/session-management'

/**
 * Hook to enforce session timeout and inactivity checks
 * Runs on all pages and monitors user activity
 */
export function useSessionTimeout() {
  const router = useRouter()
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const expiryCheckTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check session validity on mount
    const session = getCurrentSession()
    if (!session || !session.isActive) {
      router.push('/dashboard')
      return
    }

    // Set up inactivity tracking
    const handleUserActivity = () => {
      console.log('[v0] User activity detected, updating session')
      updateSessionActivity()

      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      // Reset inactivity timer
      inactivityTimerRef.current = setTimeout(() => {
        console.log('[v0] Session timeout due to inactivity')
        endSession()
        router.push('/dashboard?reason=session-timeout')
      }, 30 * 60 * 1000) // 30 minutes
    }

    // Listen for user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity)
    })

    // Set up periodic expiry check (every minute)
    expiryCheckTimerRef.current = setInterval(() => {
      const currentSession = getCurrentSession()
      if (!currentSession || !currentSession.isActive) {
        console.log('[v0] Session expired, redirecting to dashboard')
        router.push('/dashboard?reason=session-expired')
      }
    }, 60 * 1000)

    // Initial activity update
    handleUserActivity()

    return () => {
      // Cleanup
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      
      if (expiryCheckTimerRef.current) {
        clearInterval(expiryCheckTimerRef.current)
      }
    }
  }, [router])
}
