import Link from 'next/link'

export default function AdminOverviewPage() {
  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Admin Overview</h1>

      <p className="mb-6">Administrative tools for managing the application.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/users" className="block p-4 bg-white rounded shadow hover:shadow-md">
          <h2 className="font-semibold">Users</h2>
          <p className="text-sm text-gray-600">Manage users: create, reset passwords, change roles, delete.</p>
        </Link>

        <Link href="/admin/categories" className="block p-4 bg-white rounded shadow hover:shadow-md">
          <h2 className="font-semibold">Categories</h2>
          <p className="text-sm text-gray-600">Manage categories and subcategories used by products.</p>
        </Link>
      </div>
    </div>
  )
}
