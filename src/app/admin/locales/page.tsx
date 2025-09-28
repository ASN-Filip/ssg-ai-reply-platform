import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LocalesAdminClient from '@/components/admin/LocalesAdminClient'

export default async function Page() {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>)
  if (!session || session.user?.role !== 'admin') {
    redirect('/signin')
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin — Locales</h1>
      <LocalesAdminClient />
    </main>
  )
}
