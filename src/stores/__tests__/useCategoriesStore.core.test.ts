import { describe, test, expect, beforeEach } from 'vitest'
import { useCategoriesStore, resetCategoriesStore } from '@/stores/useCategoriesStore'

describe('useCategoriesStore core', () => {
  beforeEach(() => {
    resetCategoriesStore()
  })

  test('createCategory adds a new main category', () => {
    const initial = useCategoriesStore.getState().categories.length
    useCategoriesStore.getState().createCategory({ name: 'New Cat' })
    const after = useCategoriesStore.getState().categories
    expect(after.length).toBe(initial + 1)
    expect(after[0].name).toBe('New Cat')
  })

  test('createSubcategory adds subcategory to existing category', () => {
    const cat = useCategoriesStore.getState().categories[0]
    const initialSubs = cat.subcategories.length
    useCategoriesStore.getState().createSubcategory(cat.id, { name: 'New Sub' })
    const updated = useCategoriesStore.getState().categories.find(c => c.id === cat.id)!
    expect(updated.subcategories.length).toBe(initialSubs + 1)
    expect(updated.subcategories[updated.subcategories.length - 1].name).toBe('New Sub')
  })
})
