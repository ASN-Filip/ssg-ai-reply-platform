import React from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/guards.server'
// no client links needed in this layout; header provides admin navigation

export const metadata = {
  title: 'Admin',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard using NextAuth session
  const ok = await isAdmin()
  if (!ok) redirect('/unauthorized')

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Admin banner removed — admin links are available from the top-level Header */}
        {children}
      </main>
    </div>
  )
}
