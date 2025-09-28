import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { categories as initialCategories } from '@/data/categories'

export type Subcategory = { id: string; name: string }
export type Category = { id: string; name: string; subcategories: Subcategory[] }

export type CategoriesState = {
  categories: Category[]
  setCategories: (c: Category[]) => void
  createCategory: (vals: { id?: string; name: string }) => void
  createSubcategory: (categoryId: string, vals: { id?: string; name: string }) => void
  deleteCategory: (id: string) => void
  deleteSubcategory: (categoryId: string, subId: string) => void
}

export const useCategoriesStore = create<CategoriesState>()(devtools((set) => ({
  categories: initialCategories as Category[],
  setCategories: (c) => set({ categories: c }),
  createCategory: (vals) => {
    const id = vals.id ?? ('c' + (Math.random() * 100000 | 0))
    const cat: Category = { id, name: vals.name, subcategories: [] }
    set(state => ({ categories: [cat, ...state.categories] }))
  },
  createSubcategory: (categoryId, vals) => {
    const id = vals.id ?? ('s' + (Math.random() * 100000 | 0))
    set(state => ({ categories: state.categories.map(c => c.id === categoryId ? { ...c, subcategories: [...c.subcategories, { id, name: vals.name }] } : c) }))
  },
  deleteCategory: (id) => set(state => ({ categories: state.categories.filter(c => c.id !== id) })),
  deleteSubcategory: (categoryId, subId) => set(state => ({ categories: state.categories.map(c => c.id === categoryId ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subId) } : c) })),
})))

export function resetCategoriesStore() {
  useCategoriesStore.setState({ categories: initialCategories } as Partial<CategoriesState>)
}
