import { getServerAuthSession } from './auth'

export async function getSession() {
  return await getServerAuthSession()
}

export async function isAuthenticated() {
  const s = await getSession()
  return !!s?.user?.email
}

export async function isAdmin() {
  const s = await getSession()
  return s?.user?.role === 'admin'
}
