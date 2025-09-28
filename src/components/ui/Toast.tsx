"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

// Local toast constants (moved out of the legacy store)
export const TOAST_TTL_MS = 3000
export const TOAST_MAX = 3

type ToastItem = { id: string; message: string; type?: 'info' | 'success' | 'error' }

const ToastContext = createContext<{ show: (msg: string, type?: ToastItem['type']) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const show = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setItems(prev => {
      const next = [...prev, { id, message, type }]
      // enforce same max queue behavior as legacy store
      if (next.length > TOAST_MAX) return next.slice(next.length - TOAST_MAX)
      return next
    })
    const ttl = typeof TOAST_TTL_MS === 'number' ? TOAST_TTL_MS : 4000
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), ttl)
  }, [])

  // No external bridge: callers should use the ToastProvider and useToast()

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed right-4 bottom-6 flex flex-col gap-2 z-50">
        {items.map(i => (
          <div key={i.id} role="status" aria-live="polite" className={`px-3 py-2 rounded shadow text-sm max-w-xs ${i.type === 'error' ? 'bg-red-600 text-white' : i.type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}`}>
            {i.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
export default ToastProvider

// Backwards-compatible renderer: if someone imports and renders <Toast />
// this will be a no-op unless a ToastProvider is present.
// Note: ToastRenderer and external bridge removed. Use <ToastProvider> and useToast().
