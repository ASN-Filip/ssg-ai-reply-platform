export type CategoryTreeNode = {
  id: string
  name: string
  label: string
  categoryType: string | null
  subcategories: CategoryTreeNode[]
}

export type AdminCategory = {
  id: string
  categoryId: string | null
  name: string
  categoryType: string | null
  label: string
  description: string | null
  aiTrainingData: string | null
  parentId: string | null
  productIds: string[]
  createdAt: string
  updatedAt: string
  subcategories: AdminCategory[]
}

export type CategoryFormValues = {
  id?: string
  parentId: string | null
  categoryId: string
  name: string
  categoryType: string
  label: string
  description: string
  aiTrainingData: string
}

export type CategoryMutationInput = {
  name: string
  label: string
  categoryId?: string | null
  categoryType?: string | null
  description?: string | null
  aiTrainingData?: string | null
  parentId?: string | null
}
