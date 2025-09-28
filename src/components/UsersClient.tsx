"use client"

import React from 'react'
import ConfirmDialog from './ui/ConfirmDialog'
import { useToast } from './ui/Toast'
import UserFormDialog from './ui/UserFormDialog'
import { useUsersStore, type User, type State } from '@/stores/useUsersStore'

export default function UsersClient() {
  const users = useUsersStore((state: State) => state.users)
  const createUser = useUsersStore((state: State) => state.createUser)
  const updateUser = useUsersStore((state: State) => state.updateUser)
  const deleteUser = useUsersStore((state: State) => state.deleteUser)
  const resetPassword = useUsersStore((state: State) => state.resetPassword)
  const confirmUserId = useUsersStore((state: State) => state.confirmUserId)
  const openConfirm = useUsersStore((state: State) => state.openConfirm)
  
  const editingUser = useUsersStore((state: State) => state.editingUser)
  const openEdit = useUsersStore((state: State) => state.openEdit)

  const { show } = useToast()

  const [query, setQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')
  // editingUser is now stored in global store

  const filtered = React.useMemo(() => {
    return (users as User[]).filter((u: User) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (query && !(u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))) return false
      return true
    })
  }, [users, query, roleFilter])

  function openCreate() {
    openEdit({ name: '', email: '', role: 'user' })
  }

  // use store's openEdit directly where needed

  function handleDelete(userId: string) {
    openConfirm(userId)
  }

  function performDelete(userId: string) {
    deleteUser(userId)
    show('User deleted', 'success')
  }

  function handleResetPassword(userId: string) {
    resetPassword(userId)
    show(`Password reset link sent for user ${userId}`, 'info')
  }

  function saveUser(vals: { id?: string; name: string; email: string; role: string }) {
    if (vals.id) {
      updateUser({ id: vals.id, name: vals.name, email: vals.email, role: vals.role })
      show('User updated', 'success')
    } else {
      createUser({ name: vals.name, email: vals.email, role: vals.role })
      show('User created', 'success')
    }
  openEdit(null)
  }

  function handleChangeRole(userId: string, role: string) {
    const u = (users as User[]).find((x: User) => x.id === userId)
    if (!u) return
    updateUser({ id: userId, name: u.name, email: u.email, role })
    show('User updated', 'success')
  }

  // auto-clear toast after 3s
  // toast auto-clear is handled by the store's setToast implementation

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users by name or email" className="border rounded px-3 py-2" />
          <select aria-label="Filter by role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="all">All roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        <div>
          <button onClick={openCreate} className="bg-samsung-blue text-white px-3 py-2 rounded">Add new user</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(u => (
          <article key={u.id} className="p-4 bg-white rounded shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{u.name}</h4>
                <div className="text-sm text-gray-600">{u.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm mb-1">Role: {u.role}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleResetPassword(u.id)} className="text-sm px-2 py-1 border rounded">Reset password</button>
                  <select aria-label={`Change role for ${u.name}`} value={u.role} onChange={e => handleChangeRole(u.id, e.target.value)} className="text-sm border px-2 py-1 rounded">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="analytics">Analytics</option>
                  </select>
                  <button onClick={() => openEdit(u)} className="text-sm px-2 py-1 border rounded">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="text-sm px-2 py-1 border rounded text-red-600">Delete</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      <ConfirmDialog
        open={!!confirmUserId}
        title="Confirm delete"
        message="Delete user? This is a mock action."
        onCancel={() => openConfirm(null)}
        onConfirm={() => confirmUserId && performDelete(confirmUserId)}
      />
  {/* ToastProvider renders toasts globally; no local renderer required */}

  <UserFormDialog open={!!editingUser} initial={editingUser ?? undefined} title={editingUser?.id ? 'Edit user' : 'Create user'} onCancel={() => openEdit(null)} onSave={saveUser} />
    </div>
  )
}
