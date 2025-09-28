"use client"

import React from 'react'
import type { AdminCategory, CategoryFormValues, CategoryMutationInput } from '@/lib/categories/types'
import { useAdminCategories } from '@/hooks/useCategories'
import { useToast } from '@/hooks/useToast'
import CategoryFormDialog from './admin/CategoryFormDialog'
import ConfirmDialog from './ui/ConfirmDialog'

type FormState =
  | { mode: 'create'; parent: AdminCategory | null }
  | { mode: 'edit'; category: AdminCategory; parent: AdminCategory | null }

function defaultValues(parent: AdminCategory | null): CategoryFormValues {
  return {
    parentId: parent?.id ?? null,
    categoryId: '',
    name: '',
    categoryType: '',
    label: '',
    description: '',
    aiTrainingData: '',
  }
}

function toFormValues(category: AdminCategory): CategoryFormValues {
  return {
    id: category.id,
    parentId: category.parentId,
    categoryId: category.categoryId ?? '',
    name: category.name,
    categoryType: category.categoryType ?? '',
    label: category.label,
    description: category.description ?? '',
    aiTrainingData: category.aiTrainingData ?? '',
  }
}

function toMutationInput(values: CategoryFormValues): CategoryMutationInput {
  const trim = (value: string) => value.trim()
  const nullable = (value: string) => {
    const next = value.trim()
    return next.length > 0 ? next : null
  }

  return {
    name: trim(values.name),
    label: trim(values.label),
    categoryId: nullable(values.categoryId),
    categoryType: nullable(values.categoryType),
    description: nullable(values.description ?? ''),
    aiTrainingData: nullable(values.aiTrainingData ?? ''),
    parentId: values.parentId ?? null,
  }
}

export default function CategoriesClient() {
  const { categories, isLoading, isError, error, createCategory, updateCategory, deleteCategory, createPending, updatePending } = useAdminCategories()
  const { show } = useToast()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [formState, setFormState] = React.useState<FormState | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<AdminCategory | null>(null)

  React.useEffect(() => {
    if (categories.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId) {
      setSelectedId(categories[0].id)
      return
    }
    const exists = categories.some((category) => category.id === selectedId)
    if (!exists) {
      setSelectedId(categories[0]?.id ?? null)
    }
  }, [categories, selectedId])

  const selectedCategory = React.useMemo(() => {
    if (!selectedId) return categories[0] ?? null
    return categories.find((category) => category.id === selectedId) ?? categories[0] ?? null
  }, [categories, selectedId])

  const formParentName = React.useMemo(() => {
    if (!formState) return null
    if (formState.mode === 'create') return formState.parent?.name ?? null
    return formState.parent?.name ?? (formState.category.parentId ? selectedCategory?.name ?? null : null)
  }, [formState, selectedCategory])

  const formInitialValues: CategoryFormValues | null = React.useMemo(() => {
    if (!formState) return null
    if (formState.mode === 'create') {
      return defaultValues(formState.parent ?? null)
    }
    return toFormValues(formState.category)
  }, [formState])

  async function handleSave(values: CategoryFormValues) {
    const input = toMutationInput(values)

    try {
      if (formState?.mode === 'create') {
        await createCategory(input)
        show('Category created', 'success')
      } else if (formState?.mode === 'edit' && formState.category.id) {
        await updateCategory({ ...input, id: formState.category.id })
        show('Category updated', 'success')
      }
      setFormState(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      show(message, 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    if (deleteTarget.subcategories.length > 0) {
      show('Remove subcategories before deleting this category', 'error')
      return
    }
    try {
      await deleteCategory(deleteTarget.id)
      show('Category deleted', 'success')
      if (selectedId === deleteTarget.id) {
        setSelectedId(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      show(message, 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  function openCreate(parent: AdminCategory | null) {
    setFormState({ mode: 'create', parent })
  }

  // Listen for header CTA events dispatched from the AdminCategoriesHeader component
  React.useEffect(() => {
    function onAddCategory() {
      openCreate(null)
    }
    window.addEventListener('admin:add-category', onAddCategory as EventListener)
    return () => {
      window.removeEventListener('admin:add-category', onAddCategory as EventListener)
    }
  }, [])

  function openEdit(category: AdminCategory, parent: AdminCategory | null) {
    setFormState({ mode: 'edit', category, parent })
  }

  function renderCategoryList() {
    if (isLoading) {
      return <div className="text-sm text-gray-500">Loading categories…</div>
    }

    if (isError) {
      const message = error instanceof Error ? error.message : 'Failed to load categories'
      return <div className="text-sm text-red-600">{message}</div>
    }

    if (categories.length === 0) {
      return (
        <div className="rounded border border-dashed p-4 text-sm text-gray-600">
          <p>No categories yet.</p>
          <button
            onClick={() => openCreate(null)}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add category
          </button>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={() => openCreate(null)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add category
        </button>
        <ul className="space-y-1">
          {categories.map((category) => {
            const isActive = selectedCategory?.id === category.id
            return (
              <li key={category.id}>
                <button
                  onClick={() => setSelectedId(category.id)}
                  className={`w-full rounded border px-3 py-2 text-left transition ${isActive ? 'border-samsung-blue bg-samsung-blue/10' : 'border-gray-200 hover:border-samsung-blue/60'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{category.name}</span>
                    <span className="text-xs text-gray-500">{category.subcategories.length} subcategories</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{category.label}</div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  function renderSelectedCategoryDetails() {
    if (isLoading) {
      return <div className="rounded border p-6 text-sm text-gray-500">Loading category…</div>
    }

    if (isError) {
      const message = error instanceof Error ? error.message : 'Failed to load categories'
      return <div className="rounded border border-red-300 bg-red-50 p-6 text-sm text-red-600">{message}</div>
    }

    if (!selectedCategory) {
      return (
        <div className="rounded border border-dashed p-6 text-sm text-gray-600">
          Select a category to see details.
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
            <p className="text-sm text-gray-600">
              {selectedCategory.categoryType ? selectedCategory.categoryType : 'No category type'} ·{' '}
              {selectedCategory.categoryId ? `ID: ${selectedCategory.categoryId}` : 'No external ID'}
            </p>
            <p className="text-xs text-gray-500">
              Created {new Date(selectedCategory.createdAt).toLocaleString()} • Updated {new Date(selectedCategory.updatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => openEdit(selectedCategory, null)} className="rounded-md border px-3 py-2 text-sm font-semibold">
              Edit category
            </button>
            <button
              onClick={() => setDeleteTarget(selectedCategory)}
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
              disabled={selectedCategory.subcategories.length > 0}
              title={selectedCategory.subcategories.length > 0 ? 'Remove subcategories first' : undefined}
            >
              Delete
            </button>
            <button
              onClick={() => openCreate(selectedCategory)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add sub category
            </button>
          </div>
        </header>

        <section className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold">Localized labels</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-gray-500">nl_BE</p>
              <p className="text-sm font-medium">{selectedCategory.label}</p>
            </div>
          </div>

          {(selectedCategory.description || selectedCategory.aiTrainingData) ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded border border-gray-100 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold">Description</h4>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{selectedCategory.description ?? '—'}</p>
              </div>
              <div className="rounded border border-gray-100 bg-gray-50 p-4">
                <h4 className="text-sm font-semibold">AI training data</h4>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{selectedCategory.aiTrainingData ?? '—'}</p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Subcategories</h3>
            <button
              onClick={() => openCreate(selectedCategory)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add sub category
            </button>
          </div>

          {selectedCategory.subcategories.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No subcategories yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-gray-100">
              {selectedCategory.subcategories.map((child) => (
                <li key={child.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-xs text-gray-500">{child.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(child, selectedCategory)} className="rounded-md border px-3 py-1 text-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(child)}
                      className="rounded-md border border-red-200 px-3 py-1 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Categories</h2>
      <div className="grid gap-6 md:grid-cols-[minmax(240px,280px)_1fr]">
        <aside className="space-y-4">
          {renderCategoryList()}
        </aside>
        <section>{renderSelectedCategoryDetails()}</section>
      </div>

      {formState && formInitialValues ? (
        <CategoryFormDialog
          open={!!formState}
          mode={formState.mode}
          initial={formInitialValues}
          parentName={formParentName}
          onCancel={() => setFormState(null)}
          onSubmit={handleSave}
          submitting={formState.mode === 'create' ? createPending : updatePending}
        />
      ) : null}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category"
        message={deleteTarget ? (
          <div className="space-y-2 text-sm">
            <p>Delete <strong>{deleteTarget.name}</strong>?</p>
            {deleteTarget.subcategories.length > 0 ? (
              <p className="text-red-600">This category still has subcategories. Remove them first.</p>
            ) : null}
          </div>
        ) : null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
