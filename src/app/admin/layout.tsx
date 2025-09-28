import React from 'react'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/guards.server'
import Link from 'next/link'

export const metadata = {
  title: 'Admin',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard using NextAuth session
  const ok = await isAdmin()
  if (!ok) redirect('/unauthorized')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin</h1>
          <nav>
            <Link href="/admin/users" className="mr-4 text-sm text-gray-700">Users</Link>
            <Link href="/admin/categories" className="text-sm text-gray-700">Categories</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Client-side guard can be added inside pages/components as needed */}
        {children}
      </main>
    </div>
  )
}
