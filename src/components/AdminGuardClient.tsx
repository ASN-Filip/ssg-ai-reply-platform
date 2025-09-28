"use client"

import React from 'react'

export default function AdminGuardClient({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    try {
      const role = window.localStorage.getItem('mockRole')
      setIsAdmin(role === 'admin')
    } catch {
      setIsAdmin(false)
    }
  }, [])

  if (isAdmin === null) return null
  if (!isAdmin) return <div className="text-red-600">You are not authorized to view this content.</div>

  return <>{children}</>
}
