import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdminCategory, CategoryMutationInput, CategoryTreeNode } from '@/lib/categories/types'

const PUBLIC_CATEGORIES_KEY = ['categories'] as const
const ADMIN_CATEGORIES_KEY = ['admin-categories'] as const

type ApiFetchOptions = RequestInit & { json?: unknown }

async function request<T>(input: RequestInfo, init?: ApiFetchOptions): Promise<T> {
	const { json, headers, ...rest } = init ?? {}
	const initWithJson = json !== undefined
		? {
				...rest,
				headers: {
					'content-type': 'application/json',
					...headers,
				},
				body: JSON.stringify(json),
			}
		: init

	const response = await fetch(input, initWithJson)
	const text = await response.text().catch(() => '')
	let payload: unknown = undefined

	if (text) {
		try {
			payload = JSON.parse(text)
		} catch {
			payload = text
		}
	}

	if (!response.ok) {
		const message = typeof payload === 'object' && payload && 'error' in payload
			? String((payload as { error?: unknown }).error ?? 'Request failed')
			: response.statusText || 'Request failed'
		throw new Error(message)
	}

	return payload as T
}

async function fetchPublicCategories(): Promise<CategoryTreeNode[]> {
	return request<CategoryTreeNode[]>('/api/categories', {
		cache: 'no-store',
	})
}

async function fetchAdminCategories(): Promise<AdminCategory[]> {
	const data = await request<{ categories: AdminCategory[] }>('/api/admin/categories', {
		cache: 'no-store',
	})
	return data.categories
}

async function createCategory(input: CategoryMutationInput) {
	const data = await request<{ category: AdminCategory }>('/api/admin/categories', {
		method: 'POST',
		json: input,
	})
	return data.category
}

async function updateCategory(payload: CategoryMutationInput & { id: string }) {
	const data = await request<{ category: AdminCategory }>('/api/admin/categories', {
		method: 'PUT',
		json: payload,
	})
	return data.category
}

async function deleteCategory(id: string) {
	await request<{ id: string }>('/api/admin/categories', {
		method: 'DELETE',
		json: { id },
	})
	return id
}

export function useCategories() {
	return useQuery<CategoryTreeNode[]>({
		queryKey: PUBLIC_CATEGORIES_KEY,
		queryFn: fetchPublicCategories,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60,
	})
}

export function useAdminCategories() {
	const queryClient = useQueryClient()

	const listQuery = useQuery<AdminCategory[]>({
		queryKey: ADMIN_CATEGORIES_KEY,
		queryFn: fetchAdminCategories,
		refetchOnWindowFocus: false,
	})

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_KEY })
		queryClient.invalidateQueries({ queryKey: PUBLIC_CATEGORIES_KEY })
	}

	const createMutation = useMutation({
		mutationFn: createCategory,
		onSuccess: invalidate,
	})

	const updateMutation = useMutation({
		mutationFn: updateCategory,
		onSuccess: invalidate,
	})

	const deleteMutation = useMutation({
		mutationFn: deleteCategory,
		onSuccess: invalidate,
	})

	return {
		categories: listQuery.data ?? [],
		isLoading: listQuery.isLoading,
		isError: listQuery.isError,
		error: listQuery.error,
		refetch: listQuery.refetch,
		createCategory: createMutation.mutateAsync,
		updateCategory: updateMutation.mutateAsync,
		deleteCategory: deleteMutation.mutateAsync,
		createPending: createMutation.isPending,
		updatePending: updateMutation.isPending,
		deletePending: deleteMutation.isPending,
	}
}
