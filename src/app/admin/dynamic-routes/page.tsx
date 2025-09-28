import React from 'react'
import { SiteMapItem } from '@/lib/siteMap.server'
import GeneratePlaceholderClient from '@/components/GeneratePlaceholderClient'

type MapResponse = { static: SiteMapItem[]; dynamic: SiteMapItem[] }

async function getDynamicRoutes(): Promise<MapResponse> {
  const res = await fetch('/api/site-map')
  if (!res.ok) return { static: [], dynamic: [] }
  return res.json()
}

export default async function DynamicRoutesPage() {
  const map = await getDynamicRoutes()

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dynamic Routes</h1>
      <p className="mb-4">These are dynamic routes detected in the app (placeholders like <code>[id]</code>).</p>

      <div className="space-y-3">
        {map.dynamic.length === 0 ? (
          <div>No dynamic routes detected.</div>
        ) : (
          map.dynamic.map((d: SiteMapItem) => (
            <div key={d.path} className="p-3 bg-white rounded shadow">
              <div className="font-semibold">{d.path}</div>
              <div className="text-sm text-gray-600">{d.label}</div>
              <GeneratePlaceholderClient path={d.path} />
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <form action="/api/site-map" method="post">
          <button className="px-4 py-2 bg-samsung-blue text-white rounded">Regenerate cache</button>
        </form>
      </div>
    </div>
  )
}
