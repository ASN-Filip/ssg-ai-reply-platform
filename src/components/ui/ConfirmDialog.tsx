import React from 'react'

type Props = {
  open: boolean
  title?: string
  message: React.ReactNode
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmDialog({ open, title = 'Confirm', message, onCancel, onConfirm }: Props) {
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white border p-6 rounded shadow">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
        </div>
      </div>
    </div>
  )
}
