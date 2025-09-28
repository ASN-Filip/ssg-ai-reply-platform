import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { users as initialUsers } from '@/data/users'

export type User = (typeof initialUsers)[number]

export type EditUser = { id?: string; name: string; email: string; role: string }

export type ToastItem = { id: string; message: string }

export const TOAST_TTL_MS = 3000
export const TOAST_MAX = 3

export type State = {
  users: User[]
  toastQueue: ToastItem[]
  confirmUserId: string | null
  editingUser: EditUser | null
  setUsers: (u: User[]) => void
  createUser: (vals: { name: string; email: string; role: string }) => void
  updateUser: (vals: { id: string; name: string; email: string; role: string }) => void
  deleteUser: (id: string) => void
  resetPassword: (id: string) => void
  openEdit: (u: EditUser | null) => void
  openConfirm: (id: string | null) => void
  // showToast pushes a toast into the queue and auto-removes it after TTL
  showToast: (msg: string, ttl?: number) => void
  removeToast: (id: string) => void
}

export const useUsersStore = create<State>()(devtools((set) => ({
  users: initialUsers,
  toastQueue: [],
  confirmUserId: null,
  editingUser: null,
  setUsers: (u) => set({ users: u }),
  createUser: (vals) => {
    const id = 'u' + (Math.random() * 100000 | 0)
    const user: User = { id, name: vals.name, email: vals.email, role: vals.role, createdAt: new Date().toISOString(), lastLogin: null }
    set(state => ({ users: [user, ...state.users] }))
    // push toast
    ;(getShowToast())('User created')
  },
  updateUser: (vals) => {
    set(state => ({ users: state.users.map(u => u.id === vals.id ? { ...u, name: vals.name, email: vals.email, role: vals.role } : u) }))
    ;(getShowToast())('User updated')
  },
  deleteUser: (id) => {
    set(state => ({ users: state.users.filter(u => u.id !== id), confirmUserId: null }))
    ;(getShowToast())('User deleted')
  },
  resetPassword: (id) => {
    ;(getShowToast())(`Password reset link sent for user ${id}`)
  },
  openEdit: (u) => set({ editingUser: u }),
  openConfirm: (id) => set({ confirmUserId: id }),
  showToast: (msg, ttl) => {
    const id = 't' + (Math.random() * 100000 | 0)
    set(state => {
      const next = [{ id, message: msg }, ...state.toastQueue]
      // enforce max queue length by dropping oldest
      if (next.length > TOAST_MAX) return ({ toastQueue: next.slice(0, TOAST_MAX) })
      return ({ toastQueue: next })
    })
    const _ttl = typeof ttl === 'number' ? ttl : TOAST_TTL_MS
    const timer = setTimeout(() => {
      useUsersStore.setState(state => ({ toastQueue: state.toastQueue.filter(t => t.id !== id) }))
    }, _ttl)
    // record timer so reset can clear it if needed
    toastTimers.set(id, timer)
  },
  removeToast: (id) => {
    const timer = toastTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      toastTimers.delete(id)
    }
    set(state => ({ toastQueue: state.toastQueue.filter(t => t.id !== id) }))
  },
})))

// Helper for tests: reset the store back to the initial state
// internal map to keep track of per-toast timers
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>()

function getShowToast() {
  return (msg: string, ttl?: number) => useUsersStore.getState().showToast(msg, ttl)
}

export function resetUsersStore() {
  // clear timers
  for (const t of toastTimers.values()) clearTimeout(t)
  toastTimers.clear()
  useUsersStore.setState({
    users: initialUsers,
    toastQueue: [],
    confirmUserId: null,
    editingUser: null,
  } as Partial<State>)
}

// convenience helper
export const showToast = (msg: string, ttl?: number) => useUsersStore.getState().showToast(msg, ttl)
