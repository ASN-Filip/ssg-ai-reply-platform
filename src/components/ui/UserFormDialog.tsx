import React from 'react'

type Values = { id?: string; name: string; email: string; role: string }

type Props = {
  open: boolean
  initial?: Values
  title?: string
  onCancel: () => void
  onSave: (vals: Values) => void
}

export default function UserFormDialog({ open, initial, title = 'User', onCancel, onSave }: Props) {
  const [vals, setVals] = React.useState<Values>(initial || { name: '', email: '', role: 'user' })
  const nameRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    setVals(initial || { name: '', email: '', role: 'user' })
  }, [initial])

  React.useEffect(() => {
    if (open) {
      // focus the name input when dialog opens
      nameRef.current?.focus()
    }
  }, [open])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white border p-6 rounded shadow w-full max-w-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="flex flex-col gap-2">
          <input ref={nameRef} value={vals.name} onChange={e => setVals(s => ({ ...s, name: e.target.value }))} placeholder="Name" className="border px-2 py-1 rounded" />
          <input value={vals.email} onChange={e => setVals(s => ({ ...s, email: e.target.value }))} placeholder="Email" className="border px-2 py-1 rounded" />
          <select value={vals.role} onChange={e => setVals(s => ({ ...s, role: e.target.value }))} className="border px-2 py-1 rounded" aria-label="User role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={() => onSave(vals)} className="px-3 py-1 rounded bg-samsung-blue text-white">Save</button>
        </div>
      </div>
    </div>
  )
}
