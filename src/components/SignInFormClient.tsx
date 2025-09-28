"use client"
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import OAuthButton from './OAuthButton'
import Toast from './Toast'

export default function SignInFormClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{message: string; type?: 'info'|'success'|'error'} | null>(null)
  const [remember, setRemember] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('signin:email')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (remember) localStorage.setItem('signin:email', email)
    else localStorage.removeItem('signin:email')

    const res = await signIn('credentials', { redirect: false, email, password })
    setLoading(false)

    if (!res) return setError('No response from sign-in')
    if (res.error) { setError(res.error); setToast({ message: res.error, type: 'error' }); return }

    // on success, redirect to home
    setToast({ message: 'Signed in', type: 'success' })
    if (res.ok) window.location.href = '/'
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      {/* OAuth providers */}
      <div className="space-y-3 mb-4">
        <OAuthButton provider="google">
          <svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.9 0 7 1.6 9.1 3.1l6.7-6.6C35.6 2.8 30.1 0 24 0 14.7 0 6.9 4.8 3 12.1l7.9 6.2C12.5 13 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8h12.8c-.5 2.6-2.1 5-4.4 6.6l6.8 5.2C44.6 36.6 46.5 30.8 46.5 24.5z"/>
            <path fill="#FBBC05" d="M10.9 29.1c-.8-2.2-1.3-4.6-1.3-7 0-2.4.5-4.8 1.3-7L3 8.9C1.1 12.8 0 18 0 24c0 6 1.1 11.2 3 15.1l7.9-6z"/>
            <path fill="#34A853" d="M24 48c6.1 0 11.6-2 15.5-5.5l-7.9-6.1C31.2 36.3 27.9 37.5 24 37.5c-6.2 0-11.5-3.5-13.1-8.6L3 31.1C6.9 39.2 14.7 48 24 48z"/>
          </svg>
          Sign in with Google
        </OAuthButton>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <hr className="flex-1 border-t" />
        <span className="text-xs text-gray-400">or</span>
        <hr className="flex-1 border-t" />
      </div>

      <form onSubmit={onSubmit}>
        <label className="block mb-2">
          <span className="text-sm">Email</span>
          <input className="mt-1 block w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="block mb-2">
          <span className="text-sm">Password</span>
          <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} />
        </label>

        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Remember me
          </label>
          <a href="/forgot-password" className="text-sm text-blue-600">Forgot password?</a>
        </div>

        <button disabled={loading} className="w-full bg-blue-600 text-white px-3 py-2 rounded">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
