import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface FavoritesState {
  items: Product[]
  addFavorite: (product: Product) => void
  removeFavorite: (productId: number) => void
  toggleFavorite: (product: Product) => void
  isFavorite: (productId: number) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addFavorite: (product: Product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state
          }
          return {
            items: [...state.items, product],
          }
        })
      },
      
      removeFavorite: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },
      
      toggleFavorite: (product: Product) => {
        const isFav = get().isFavorite(product.id)
        if (isFav) {
          get().removeFavorite(product.id)
        } else {
          get().addFavorite(product)
        }
      },
      
      isFavorite: (productId: number) => {
        return get().items.some((item) => item.id === productId)
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
