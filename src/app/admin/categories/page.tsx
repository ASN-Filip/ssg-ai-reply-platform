import React from 'react'
import CategoriesClient from '@/components/CategoriesClient'
import AdminCategoriesHeader from '@/components/admin/AdminCategoriesHeader'

export default function AdminCategoriesPage() {
  return (
    <div id="root">
      <div className="min-h-screen flex flex-col bg-gray-100">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Category Management</h1>
            <AdminCategoriesHeader />
          </div>

          <CategoriesClient />
        </main>
      </div>
    </div>
  )
}
