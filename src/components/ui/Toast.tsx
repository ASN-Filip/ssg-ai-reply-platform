import React from 'react'
import { useUsersStore } from '@/stores/useUsersStore'

export default function Toast() {
  const queue = useUsersStore(state => state.toastQueue)
  const removeToast = useUsersStore(state => state.removeToast)

  if (!queue || queue.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {queue.map(t => (
        <div key={t.id} role="status" aria-live="polite" className="bg-black text-white px-4 py-2 rounded">
          <div className="flex items-center justify-between gap-4">
            <div>{t.message}</div>
            <button className="text-sm ml-4 text-gray-300" onClick={() => removeToast(t.id)}>Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  )
}
