"use client"

import React, { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import AuthLoadingSkeleton from './AuthLoadingSkeleton'

export default function ClientAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    // Always allow the sign-in page and NextAuth routes to render without blocking
    if (!pathname || pathname === '/signin' || pathname.startsWith('/api/auth')) {
      setChecked(true)
      return
    }

    getSession().then((session) => {
      if (!mounted) return
      setHasSession(!!session)
      setChecked(true)
      if (!session) {
        // small debounce so navigation isn't competing with other route changes
        setTimeout(() => {
          if (!mounted) return
          router.replace('/signin')
        }, 50)
      }
    }).catch(() => {
      if (!mounted) return
      setHasSession(false)
      setChecked(true)
      setTimeout(() => { if (mounted) router.replace('/signin') }, 50)
    })

    return () => { mounted = false }
  }, [pathname, router])

  if (!checked) return <AuthLoadingSkeleton />
  if (hasSession === false) return <AuthLoadingSkeleton />

  return <>{children}</>
}
