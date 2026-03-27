import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface FavoritesState {
  items: Product[]
  addFavorite: (product: Product) => void
  removeFavorite: (productId: string) => void  // Changed from number to string
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: string) => boolean   // Changed from number to string
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addFavorite: (product: Product) => {
        set((state) => {
          // Check if product already exists by ID (string comparison)
          if (state.items.some((item) => String(item.id) === String(product.id))) {
            return state
          }
          return {
            items: [...state.items, product],
          }
        })
      },
      
      removeFavorite: (productId: string) => {  // Changed to string
        set((state) => ({
          items: state.items.filter((item) => String(item.id) !== String(productId)),
        }))
      },
      
      toggleFavorite: (product: Product) => {
        const isFav = get().isFavorite(String(product.id))
        if (isFav) {
          get().removeFavorite(String(product.id))
        } else {
          get().addFavorite(product)
        }
      },
      
      isFavorite: (productId: string) => {  // Changed to string
        return get().items.some((item) => String(item.id) === String(productId))
      },
      
      clearFavorites: () => {
        set({ items: [] })
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
)