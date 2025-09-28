"use client"

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient, QueryFunctionContext } from '@tanstack/react-query'
import { useToast } from '../ui/Toast'

type User = { id: string; name?: string | null; email?: string | null; role?: string | null; image?: string | null }

type UsersResponse = { users: User[]; nextCursor?: string | null }

const fetchUsers = async (context: QueryFunctionContext<readonly unknown[]>): Promise<UsersResponse> => {
  const [, params] = context.queryKey as [string, { q: string; cursor: string | null; limit: number }]
  const { q, cursor, limit } = params
  const url = new URL('/api/admin/users', location.origin)
  url.searchParams.set('limit', String(limit))
  if (cursor) url.searchParams.set('cursor', cursor)
  if (q) url.searchParams.set('q', q)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}

export default function UsersAdminClient() {
  const [q, setQ] = useState('')
  const [limit] = useState(20)
  const [cursor, setCursor] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' })
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ id: '', name: '', email: '', role: 'user', password: '' })

  const queryClient = useQueryClient()
  const { show } = useToast()
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())

  const usersQuery = useQuery<UsersResponse, Error>({ queryKey: ['admin-users', { q, cursor, limit }], queryFn: fetchUsers })

  // create mutation
  type CreateVars = { name?: string; email: string; role?: string; password: string }
  type MutationContext = { previous?: UsersResponse }

  const createMutation = useMutation<{ user: User }, Error, CreateVars, MutationContext>({
    mutationFn: async (payload) => {
      const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Create failed')
      return res.json()
    },
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['admin-users', { q, cursor, limit }] })
      const previous = queryClient.getQueryData<UsersResponse>(['admin-users', { q, cursor, limit }])
      const tempId = `tmp-${Date.now()}`
      // mark temp id as busy
      setBusyIds(s => new Set(s).add(tempId))
      const tempUser: User = { id: tempId, name: newUser.name ?? null, email: newUser.email, role: newUser.role ?? 'user' }
      queryClient.setQueryData<UsersResponse>(['admin-users', { q, cursor, limit }], (old) => {
        if (!old) return { users: [tempUser], nextCursor: null }
        return { ...old, users: [tempUser, ...old.users] }
      })
      return { previous }
    },
    onError: (err, newUser, context) => {
      if (context?.previous) queryClient.setQueryData(['admin-users', { q, cursor, limit }], context.previous)
  show('Create failed', 'error')
    },
    onSettled: () => {
      // clear busy ids and refetch
      setBusyIds(new Set())
      queryClient.invalidateQueries({ queryKey: ['admin-users', { q, cursor, limit }] })
    }
  })

  // update mutation
  type UpdateVars = { id: string; body: Record<string, unknown> }
  const updateMutation = useMutation<{ user: User }, Error, UpdateVars, MutationContext>({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Update failed')
      return res.json()
    },
    onMutate: async ({ id, body }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-users', { q, cursor, limit }] })
      const previous = queryClient.getQueryData<UsersResponse>(['admin-users', { q, cursor, limit }])
      // mark id busy
      setBusyIds(s => new Set(s).add(id))
      queryClient.setQueryData<UsersResponse>(['admin-users', { q, cursor, limit }], (old) => {
        if (!old) return old
        return { ...old, users: old.users.map((u) => u.id === id ? { ...u, ...(body as Partial<User>) } : u) }
      })
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) queryClient.setQueryData(['admin-users', { q, cursor, limit }], context.previous)
  show('Update failed', 'error')
    },
    onSettled: () => { setBusyIds(new Set()); queryClient.invalidateQueries({ queryKey: ['admin-users', { q, cursor, limit }] }) }
  })

  // delete mutation
  const deleteMutation = useMutation<{ ok?: boolean }, Error, string, MutationContext>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      return res.json()
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-users', { q, cursor, limit }] })
      const previous = queryClient.getQueryData<UsersResponse>(['admin-users', { q, cursor, limit }])
      setBusyIds(s => new Set(s).add(id))
      queryClient.setQueryData<UsersResponse>(['admin-users', { q, cursor, limit }], (old) => {
        if (!old) return old
        return { ...old, users: old.users.filter((u) => u.id !== id) }
      })
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) queryClient.setQueryData(['admin-users', { q, cursor, limit }], context.previous)
  show('Delete failed', 'error')
    },
    onSettled: () => { setBusyIds(new Set()); queryClient.invalidateQueries({ queryKey: ['admin-users', { q, cursor, limit }] }) }
  })

  const users = (usersQuery.data as UsersResponse | undefined)?.users ?? []
  const nextCursor = (usersQuery.data as UsersResponse | undefined)?.nextCursor ?? null

  function loadMore() {
    if (nextCursor) setCursor(nextCursor)
  }

  return (
    <div className="bg-white border rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <input value={q} onChange={e => { setQ(e.target.value); setCursor(null) }} placeholder="Search users" className="border px-2 py-1 rounded" />
          <button disabled={usersQuery.isLoading} onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }) }} className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
        </div>
        <div>
          <button onClick={() => setCreateOpen(true)} className="px-3 py-1 bg-green-600 text-white rounded">Add user</button>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="py-2">{u.name}</td>
              <td className="py-2">{u.email}</td>
              <td className="py-2">{u.role}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <button className="text-sm text-blue-600 mr-2" onClick={() => { setEditForm({ id: u.id, name: u.name ?? '', email: u.email ?? '', role: u.role ?? 'user', password: '' }); setEditOpen(true) }}>Edit</button>
                  <button className="text-sm text-red-600" onClick={() => deleteMutation.mutate(u.id)} disabled={busyIds.has(u.id)}>
                    {busyIds.has(u.id) ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" /><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" /></svg>
                    ) : 'Delete'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center">
        {nextCursor ? <button disabled={usersQuery.isLoading} onClick={loadMore} className="px-3 py-1 bg-gray-200 rounded">Load more</button> : <div className="text-sm text-gray-500">No more users</div>}
      </div>

      {createOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Create user</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (!form.email || !form.password) return alert('email and password are required')
              createMutation.mutate({ name: form.name || undefined, email: form.email, role: form.role, password: form.password })
              setForm({ name: '', email: '', role: 'user', password: '' })
              setCreateOpen(false)
            }} className="space-y-2">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full border px-2 py-1 rounded" />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full border px-2 py-1 rounded" />
              <select aria-label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full border px-2 py-1 rounded">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" type="password" className="w-full border px-2 py-1 rounded" />

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" disabled={createMutation.status === 'pending'} className="px-3 py-1 bg-green-600 text-white rounded">{createMutation.status === 'pending' ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Edit user</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const body: Record<string, unknown> = { name: editForm.name, email: editForm.email, role: editForm.role }
              if (editForm.password) body.password = editForm.password
              updateMutation.mutate({ id: editForm.id, body })
              setEditOpen(false)
            }} className="space-y-2">
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full border px-2 py-1 rounded" />
              <select aria-label="Role" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="w-full border px-2 py-1 rounded">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="Password (leave blank to keep)" type="password" className="w-full border px-2 py-1 rounded" />

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setEditOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" disabled={updateMutation.status === 'pending'} className="px-3 py-1 bg-blue-600 text-white rounded">{updateMutation.status === 'pending' ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
