"use client"
import { useEffect } from 'react'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ClientAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    // small guard: if already on /signin, don't attempt to redirect
    if (typeof window !== 'undefined' && window.location.pathname === '/signin') return

    // Query next-auth for a session; if none, navigate to /signin
    getSession().then((session) => {
      if (!mounted) return
      if (!session) {
        // Use replace with a slight debounce to avoid racing with other navigations
        setTimeout(() => {
          if (!mounted) return
          router.replace('/signin')
        }, 50)
      }
    })

    return () => {
      mounted = false
    }
  }, [router])

  return null
}
