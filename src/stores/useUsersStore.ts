import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { users as initialUsers } from '@/data/users'

// Note: toasts are handled by the ToastProvider (use the `useToast()` hook).
// See README.md > "Migration: Toasts" for migration details.

export type User = (typeof initialUsers)[number]

export type EditUser = { id?: string; name: string; email: string; role: string }

// Toasts are handled by the ToastProvider now

export type State = {
  users: User[]
  confirmUserId: string | null
  editingUser: EditUser | null
  setUsers: (u: User[]) => void
  createUser: (vals: { name: string; email: string; role: string }) => void
  updateUser: (vals: { id: string; name: string; email: string; role: string }) => void
  deleteUser: (id: string) => void
  resetPassword: (id: string) => void
  openEdit: (u: EditUser | null) => void
  openConfirm: (id: string | null) => void
  // Toast methods removed - use the ToastProvider and useToast() instead
}

export const useUsersStore = create<State>()(devtools((set) => ({
  users: initialUsers,
  confirmUserId: null,
  editingUser: null,
  setUsers: (u) => set({ users: u }),
  createUser: (vals) => {
    const id = 'u' + (Math.random() * 100000 | 0)
    const user: User = { id, name: vals.name, email: vals.email, role: vals.role, createdAt: new Date().toISOString(), lastLogin: null }
    set(state => ({ users: [user, ...state.users] }))
  },
  updateUser: (vals) => {
    set(state => ({ users: state.users.map(u => u.id === vals.id ? { ...u, name: vals.name, email: vals.email, role: vals.role } : u) }))
  },
  deleteUser: (id) => {
    set(state => ({ users: state.users.filter(u => u.id !== id), confirmUserId: null }))
  },
  // parameter is kept for API compatibility but intentionally unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resetPassword: (_id) => {
    // no-op: components should call the toast provider directly
  },
  openEdit: (u) => set({ editingUser: u }),
  openConfirm: (id) => set({ confirmUserId: id }),
  // toast methods removed
})))

// Helper for tests: reset the store back to the initial state
export function resetUsersStore() {
  useUsersStore.setState({
    users: initialUsers,
    confirmUserId: null,
    editingUser: null,
  } as Partial<State>)
}

// legacy showToast helper removed - use ToastProvider's useToast() instead
