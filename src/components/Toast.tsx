"use client"
import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'info', onClose }: { message: string; type?: 'info'|'success'|'error'; onClose?: ()=>void }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onClose?.() }, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  if (!visible) return null
  const bg = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800'
  return (
    <div className={`fixed bottom-6 right-6 text-white px-4 py-2 rounded ${bg}`} role="status">
      {message}
    </div>
  )
}
