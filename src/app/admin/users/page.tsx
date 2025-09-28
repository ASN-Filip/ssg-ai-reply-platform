import React from 'react'
import UsersClient from '@/components/UsersClient'
import AddUserButton from '@/components/AddUserButton'

export default function AdminUsersPage() {
  return (
    <div id="root">
      <div className="min-h-screen flex flex-col bg-gray-100">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div>
              <AddUserButton />
            </div>
          </div>

          <UsersClient />
        </main>
      </div>
    </div>
  )
}
