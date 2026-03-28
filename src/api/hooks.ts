import { useQuery } from '@tanstack/react-query'
import api from './axios'
import type { Product, Category } from '@/types'

// Query keys
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productsByCategory: (category: string) => ['products', 'category', category] as const,
  categories: ['categories'] as const,
  categoriesWithCounts: ['categories', 'withCounts'] as const,
}

// Fetch all products
export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products')
      return data
    },
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Product ID is required')
      }
      // console.log('Fetching product with ID:', id)
      const { data } = await api.get<Product>(`/products/${id}`)
      // console.log('Product data received:', data)
      return data
    },
    enabled: !!id, // Only run if id exists
    retry: 1,
  })
} 

// Fetch products by category
export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.productsByCategory(category),
    queryFn: async () => {
      const { data } = await api.get<Product[]>(
        `/products/category/${encodeURIComponent(category)}`
      )
      return data
    },
    enabled: !!category,
  })
}

// Fetch all categories (distinct)
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { data } = await api.get<string[]>('/categories')
      return data
    },
  })
}

// Fetch categories with product counts (NEW)
export function useCategoriesWithCounts() {
  return useQuery({
    queryKey: queryKeys.categoriesWithCounts,
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/products/categories/with-counts')
      // console.log(data)
      return data
    },
  })
}

// Fetch limited products (for featured sections)
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: [...queryKeys.products, 'featured', limit],
    queryFn: async () => {
      const { data } = await api.get<Product[]>(`/products?limit=${limit}`)
      return data
    },
  })
}