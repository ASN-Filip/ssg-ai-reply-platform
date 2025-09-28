"use client"

import React from 'react'
import type { CategoryFormValues } from '@/lib/categories/types'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  parentName?: string | null
  initial: CategoryFormValues
  onCancel: () => void
  onSubmit: (values: CategoryFormValues) => void
  submitting?: boolean
}

type FieldErrors = Partial<Record<keyof CategoryFormValues, string>> & { form?: string }

const initialErrors: FieldErrors = {}

export default function CategoryFormDialog({ open, mode, parentName, initial, onCancel, onSubmit, submitting = false }: Props) {
  const [values, setValues] = React.useState<CategoryFormValues>(initial)
  const [errors, setErrors] = React.useState<FieldErrors>(initialErrors)
  const firstFieldRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    setValues(initial)
    setErrors(initialErrors)
  }, [initial])

  React.useEffect(() => {
    if (open) {
      firstFieldRef.current?.focus()
    }
  }, [open])

  React.useEffect(() => {
    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    if (open) {
      window.addEventListener('keydown', onKeydown)
    }
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [open, onCancel])

  if (!open) return null

  function setField<K extends keyof CategoryFormValues>(field: K, value: CategoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {}

    if (!values.name.trim()) nextErrors.name = 'Name is required'
    if (!values.label.trim()) nextErrors.label = 'Label is required'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return
    onSubmit(values)
  }

  const dialogTitle = mode === 'create' ? (parentName ? `Add subcategory under ${parentName}` : 'Create category') : `Edit ${values.name || 'category'}`

  return (
    <div role="dialog" aria-modal="true" aria-label={dialogTitle} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <header className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{dialogTitle}</h3>
            {parentName ? <p className="text-sm text-gray-600">Parent: {parentName}</p> : <p className="text-sm text-gray-600">Parent: Root</p>}
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Display name *</label>
              <input
                ref={firstFieldRef}
                value={values.name}
                onChange={(event) => setField('name', event.target.value)}
                className={`rounded border px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Category name"
              />
              {errors.name ? <span className="text-xs text-red-600">{errors.name}</span> : null}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Category ID</label>
              <input
                value={values.categoryId}
                onChange={(event) => setField('categoryId', event.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
                placeholder="Optional external identifier"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Category type</label>
              <input
                value={values.categoryType}
                onChange={(event) => setField('categoryType', event.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
                placeholder="Optional type tagging"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Label (NL_BE) *</label>
              <input
                value={values.label}
                onChange={(event) => setField('label', event.target.value)}
                className={`rounded border px-3 py-2 ${errors.label ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Samsung NL"
              />
              {errors.label ? <span className="text-xs text-red-600">{errors.label}</span> : null}
            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={values.description}
                onChange={(event) => setField('description', event.target.value)}
                className="min-h-[96px] rounded border border-gray-300 px-3 py-2"
                placeholder="Optional description"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">AI training data</label>
              <textarea
                value={values.aiTrainingData}
                onChange={(event) => setField('aiTrainingData', event.target.value)}
                className="min-h-[96px] rounded border border-gray-300 px-3 py-2"
                placeholder="Optional system hints for AI generation"
              />
            </div>
          </div>

          {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}

          <footer className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="rounded border px-4 py-2" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="rounded bg-samsung-blue px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
