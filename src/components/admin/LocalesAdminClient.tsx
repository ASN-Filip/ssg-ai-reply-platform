"use client"

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient, QueryFunctionContext } from '@tanstack/react-query'
import { useToast } from '../ui/Toast'

type Locale = {
  id: string
  code: string
  displayName: string
  regionalNames: string[]
  description?: string | null
  bazaarVoiceApiKey?: string | null
  bvResponseApiKey?: string | null
  bvClientId?: string | null
  bvClientSecret?: string | null
  bazaarVoiceClient?: string | null
}

type LocalesResponse = { locales: Locale[]; nextCursor?: string | null }
type ApiError = { error?: string }

const fetchLocales = async (context: QueryFunctionContext<readonly unknown[]>): Promise<LocalesResponse> => {
  const [, params] = context.queryKey as [string, { q: string; cursor: string | null; limit: number }]
  const { q, cursor, limit } = params
  const url = new URL('/api/admin/locales', location.origin)
  url.searchParams.set('limit', String(limit))
  if (cursor) url.searchParams.set('cursor', cursor)
  if (q) url.searchParams.set('q', q)
  const res = await fetch(url.toString())
  if (!res.ok) {
    // try to parse JSON error body for better messages
    let json: ApiError | null = null
    try { json = await res.json() as ApiError } catch {}
    const message = json?.error || `Failed to load locales (${res.status})`
    const err = new Error(message) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return res.json()
}

export default function LocalesAdminClient() {
  const [q, setQ] = useState('')
  const [limit] = useState(20)
  const [cursor, setCursor] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  type FormState = {
    code: string
    displayName: string
    regionalNames: string
    description: string
    bazaarVoiceApiKey?: string
    bvResponseApiKey?: string
    bvClientId?: string
    bvClientSecret?: string
    bazaarVoiceClient?: string
  }
  const [form, setForm] = useState<FormState>({ code: '', displayName: '', regionalNames: '', description: '', bazaarVoiceApiKey: '', bvResponseApiKey: '', bvClientId: '', bvClientSecret: '', bazaarVoiceClient: '' })
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<FormState & { id: string }>({ id: '', code: '', displayName: '', regionalNames: '', description: '', bazaarVoiceApiKey: '', bvResponseApiKey: '', bvClientId: '', bvClientSecret: '', bazaarVoiceClient: '' })
  
  const [secretsOpen, setSecretsOpen] = useState(false)
  const [decryptedSecrets, setDecryptedSecrets] = useState<{
    id: string
    code: string
    displayName: string
    bazaarVoiceApiKey: string | null
    bvResponseApiKey: string | null
    bvClientSecret: string | null
    bvClientId: string | null
    bazaarVoiceClient: string | null
  } | null>(null)

  const queryClient = useQueryClient()
  const { show } = useToast()

  const localesQuery = useQuery<LocalesResponse, Error>({ queryKey: ['admin-locales', { q, cursor, limit }], queryFn: fetchLocales })

  type CreateVars = Partial<Locale>
  const createMutation = useMutation<{ locale: Locale }, Error, CreateVars, unknown>({
    mutationFn: async (payload) => {
      const res = await fetch('/api/admin/locales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) {
        let json: ApiError | null = null
        try { json = await res.json() as ApiError } catch {}
        const message = json?.error || `Create failed (${res.status})`
        const err = new Error(message) as Error & { status?: number }
        err.status = res.status
        throw err
      }
      return res.json()
    },
    onError: (err: unknown) => {
      const e = err as Error & { status?: number }
      if (e.status === 403) {
        show('Forbidden — you need admin access', 'error')
      } else {
        show(e.message ?? 'Create failed', 'error')
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-locales'] })
  })

  type UpdateVars = { id: string; body: Partial<Locale> }
  const updateMutation = useMutation<{ locale: Locale }, Error, UpdateVars, unknown>({
    mutationFn: async ({ id, body }) => {
      const res = await fetch(`/api/admin/locales/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        let json: ApiError | null = null
        try { json = await res.json() as ApiError } catch {}
        const message = json?.error || `Update failed (${res.status})`
        const err = new Error(message) as Error & { status?: number }
        err.status = res.status
        throw err
      }
      return res.json()
    },
    onError: (err: unknown) => {
      const e = err as Error
      show(e.message ?? 'Update failed', 'error')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-locales'] })
  })

  const deleteMutation = useMutation<{ ok?: boolean }, Error, string, unknown>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/locales/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        let json: ApiError | null = null
        try { json = await res.json() as ApiError } catch {}
        const message = json?.error || `Delete failed (${res.status})`
        const err = new Error(message) as Error & { status?: number }
        err.status = res.status
        throw err
      }
      return res.json()
    },
    onError: (err: unknown) => {
      const e = err as Error
      show(e.message ?? 'Delete failed', 'error')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-locales'] })
  })

  type SecretsResponse = {
    secrets: {
      id: string
      code: string
      displayName: string
      bazaarVoiceApiKey: string | null
      bvResponseApiKey: string | null
      bvClientSecret: string | null
      bvClientId: string | null
      bazaarVoiceClient: string | null
    }
    auditId: string
  }
  
  const secretsMutation = useMutation<SecretsResponse, Error, string, unknown>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/locales/${id}/secrets`)
      if (!res.ok) {
        let json: ApiError | null = null
        try { json = await res.json() as ApiError } catch {}
        const message = json?.error || `Failed to fetch secrets (${res.status})`
        const err = new Error(message) as Error & { status?: number }
        err.status = res.status
        throw err
      }
      return res.json()
    },
    onSuccess: (data) => {
      setDecryptedSecrets(data.secrets)
      setSecretsOpen(true)
      show('Secrets decrypted successfully', 'success')
    },
    onError: (err: unknown) => {
      const e = err as Error & { status?: number }
      if (e.status === 403) {
        show('Forbidden — you need admin access to view secrets', 'error')
      } else {
        show(e.message ?? 'Failed to fetch secrets', 'error')
      }
    }
  })

  const locales = localesQuery.data?.locales ?? []
  const nextCursor = localesQuery.data?.nextCursor ?? null
  const fetchError = localesQuery.error as unknown as (Error & { status?: number }) | null

  function loadMore() {
    if (nextCursor) setCursor(nextCursor)
  }

  return (
    <div className="bg-white border rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <input value={q} onChange={e => { setQ(e.target.value); setCursor(null) }} placeholder="Search locales" className="border px-2 py-1 rounded" />
          <button disabled={localesQuery.isLoading} onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-locales'] }) }} className="px-3 py-1 bg-blue-600 text-white rounded">Search</button>
        </div>
        <div>
          <button onClick={() => setCreateOpen(true)} className="px-3 py-1 bg-green-600 text-white rounded">Add locale</button>
        </div>
      </div>

      {/* show inline auth/error hint when fetching fails */}
      {fetchError && (
        <div className="mb-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
          {fetchError.status === 403 ? (
            <div>
              <strong>Access denied.</strong> You must be signed in as an admin to view locales.
            </div>
          ) : (
            <div>
              <strong>Error:</strong> {fetchError.message}
            </div>
          )}
        </div>
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="py-2">Code</th>
            <th className="py-2">Name</th>
            <th className="py-2">Regional names</th>
            <th className="py-2">BV client</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locales.map(l => (
            <tr key={l.id} className="border-t">
              <td className="py-2">{l.code}</td>
              <td className="py-2">{l.displayName}</td>
              <td className="py-2">{(l.regionalNames || []).join(', ')}</td>
              <td className="py-2">{l.bazaarVoiceClient ?? '-'}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <button className="text-sm text-blue-600" onClick={() => { setEditForm({ id: l.id, code: l.code, displayName: l.displayName, regionalNames: (l.regionalNames || []).join(', '), description: l.description ?? '', bazaarVoiceApiKey: '', bvResponseApiKey: '', bvClientId: l.bvClientId ?? '', bvClientSecret: '', bazaarVoiceClient: l.bazaarVoiceClient ?? '' }); setEditOpen(true) }}>Edit</button>
                  <button className="text-sm text-purple-600" onClick={() => secretsMutation.mutate(l.id)} disabled={secretsMutation.status === 'pending'}>
                    {secretsMutation.status === 'pending' ? 'Loading...' : 'Show Secrets'}
                  </button>
                  <button className="text-sm text-red-600" onClick={() => deleteMutation.mutate(l.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center">
        {nextCursor ? <button disabled={localesQuery.isLoading} onClick={loadMore} className="px-3 py-1 bg-gray-200 rounded">Load more</button> : <div className="text-sm text-gray-500">No more locales</div>}
      </div>

      {createOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Create locale</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const payload: Partial<Locale> = { code: form.code, displayName: form.displayName }
              if (form.regionalNames) payload.regionalNames = form.regionalNames.split(',').map(s => s.trim()).filter(Boolean)
              if (form.description) payload.description = form.description
              if (form.bazaarVoiceApiKey) payload.bazaarVoiceApiKey = form.bazaarVoiceApiKey
              if (form.bvResponseApiKey) payload.bvResponseApiKey = form.bvResponseApiKey
              if (form.bvClientId) payload.bvClientId = form.bvClientId
              if (form.bvClientSecret) payload.bvClientSecret = form.bvClientSecret
              if (form.bazaarVoiceClient) payload.bazaarVoiceClient = form.bazaarVoiceClient
              createMutation.mutate(payload)
              setForm({ code: '', displayName: '', regionalNames: '', description: '', bazaarVoiceApiKey: '', bvResponseApiKey: '', bvClientId: '', bvClientSecret: '', bazaarVoiceClient: '' })
              setCreateOpen(false)
            }} className="space-y-2">
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Locale code (e.g. nl_BE)" className="w-full border px-2 py-1 rounded" />
              <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Display name" className="w-full border px-2 py-1 rounded" />
              <input value={form.regionalNames} onChange={e => setForm(f => ({ ...f, regionalNames: e.target.value }))} placeholder="Regional names (comma-separated)" className="w-full border px-2 py-1 rounded" />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full border px-2 py-1 rounded" />
              <input value={form.bazaarVoiceApiKey} onChange={e => setForm(f => ({ ...f, bazaarVoiceApiKey: e.target.value }))} placeholder="BAZAAR_VOICE_API_KEY" className="w-full border px-2 py-1 rounded" />
              <input value={form.bvResponseApiKey} onChange={e => setForm(f => ({ ...f, bvResponseApiKey: e.target.value }))} placeholder="BV_RESPONSE_API_KEY" className="w-full border px-2 py-1 rounded" />
              <input value={form.bvClientId} onChange={e => setForm(f => ({ ...f, bvClientId: e.target.value }))} placeholder="BV_CLIENT_ID" className="w-full border px-2 py-1 rounded" />
              <input value={form.bvClientSecret} onChange={e => setForm(f => ({ ...f, bvClientSecret: e.target.value }))} placeholder="BV_CLIENT_SECRET" className="w-full border px-2 py-1 rounded" />
              <input value={form.bazaarVoiceClient} onChange={e => setForm(f => ({ ...f, bazaarVoiceClient: e.target.value }))} placeholder="BAZAAR_VOICE_CLIENT" className="w-full border px-2 py-1 rounded" />

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
            <h2 className="text-lg font-semibold mb-2">Edit locale</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const body: Partial<Locale> = { code: editForm.code, displayName: editForm.displayName }
              if (editForm.regionalNames) body.regionalNames = editForm.regionalNames.split(',').map(s => s.trim()).filter(Boolean)
              if (editForm.description) body.description = editForm.description
              if (editForm.bazaarVoiceApiKey) body.bazaarVoiceApiKey = editForm.bazaarVoiceApiKey
              if (editForm.bvResponseApiKey) body.bvResponseApiKey = editForm.bvResponseApiKey
              if (editForm.bvClientId) body.bvClientId = editForm.bvClientId
              if (editForm.bvClientSecret) body.bvClientSecret = editForm.bvClientSecret
              if (editForm.bazaarVoiceClient) body.bazaarVoiceClient = editForm.bazaarVoiceClient
              updateMutation.mutate({ id: editForm.id, body })
              setEditOpen(false)
            }} className="space-y-2">
              <input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} placeholder="Locale code (e.g. nl_BE)" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.displayName} onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Display name" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.regionalNames} onChange={e => setEditForm(f => ({ ...f, regionalNames: e.target.value }))} placeholder="Regional names (comma-separated)" className="w-full border px-2 py-1 rounded" />
              <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.bazaarVoiceApiKey} onChange={e => setEditForm(f => ({ ...f, bazaarVoiceApiKey: e.target.value }))} placeholder="BAZAAR_VOICE_API_KEY" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.bvResponseApiKey} onChange={e => setEditForm(f => ({ ...f, bvResponseApiKey: e.target.value }))} placeholder="BV_RESPONSE_API_KEY" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.bvClientId} onChange={e => setEditForm(f => ({ ...f, bvClientId: e.target.value }))} placeholder="BV_CLIENT_ID" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.bvClientSecret} onChange={e => setEditForm(f => ({ ...f, bvClientSecret: e.target.value }))} placeholder="BV_CLIENT_SECRET" className="w-full border px-2 py-1 rounded" />
              <input value={editForm.bazaarVoiceClient} onChange={e => setEditForm(f => ({ ...f, bazaarVoiceClient: e.target.value }))} placeholder="BAZAAR_VOICE_CLIENT" className="w-full border px-2 py-1 rounded" />

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setEditOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button type="submit" disabled={updateMutation.status === 'pending'} className="px-3 py-1 bg-blue-600 text-white rounded">{updateMutation.status === 'pending' ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {secretsOpen && decryptedSecrets && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Decrypted Secrets - {decryptedSecrets.displayName}</h2>
              <button 
                onClick={() => { setSecretsOpen(false); setDecryptedSecrets(null) }} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    <strong>Security Warning:</strong> These are decrypted secrets. Handle with care and close this modal when finished.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locale Code</label>
                <div className="px-3 py-2 bg-gray-50 border rounded font-mono text-sm">{decryptedSecrets.code}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BAZAAR_VOICE_API_KEY</label>
                <div className="px-3 py-2 bg-gray-50 border rounded font-mono text-sm break-all">
                  {decryptedSecrets.bazaarVoiceApiKey || '(not set)'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BV_RESPONSE_API_KEY</label>
                <div className="px-3 py-2 bg-gray-50 border rounded font-mono text-sm break-all">
                  {decryptedSecrets.bvResponseApiKey || '(not set)'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BV_CLIENT_SECRET</label>
                <div className="px-3 py-2 bg-gray-50 border rounded font-mono text-sm break-all">
                  {decryptedSecrets.bvClientSecret || '(not set)'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BV_CLIENT_ID (unencrypted)</label>
                <div className="px-3 py-2 bg-blue-50 border rounded font-mono text-sm">
                  {decryptedSecrets.bvClientId || '(not set)'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BAZAAR_VOICE_CLIENT (unencrypted)</label>
                <div className="px-3 py-2 bg-blue-50 border rounded font-mono text-sm">
                  {decryptedSecrets.bazaarVoiceClient || '(not set)'}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={() => { setSecretsOpen(false); setDecryptedSecrets(null) }} 
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
