"use client"

import React from 'react'

export default function GeneratePlaceholderClient({ path }: { path: string }) {
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState<string | null>(null)

  async function onCreate() {
    setLoading(true)
    try {
      const res = await fetch('/api/site-map/placeholders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path, title: `Placeholder for ${path}` }) })
      if (res.ok) {
        const j = await res.json()
        setDone(j.file || 'created')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <button onClick={onCreate} disabled={loading} className="px-3 py-1 bg-samsung-blue text-white rounded">
        {loading ? 'Creating…' : 'Create placeholder'}
      </button>
      {done && <div className="text-sm text-green-600 mt-2">Created: {done}</div>}
    </div>
  )
}
