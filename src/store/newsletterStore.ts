// store/newsletterStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NewsletterState {
  isSubscribed: boolean
  email: string | null
  subscribe: (email: string) => void
  unsubscribe: () => void
  checkSubscription: () => boolean
}

export const useNewsletterStore = create<NewsletterState>()(
  persist(
    (set, get) => ({
      isSubscribed: false,
      email: null,
      
      subscribe: (email: string) => {
        set({ isSubscribed: true, email })
      },
      
      unsubscribe: () => {
        set({ isSubscribed: false, email: null })
      },
      
      checkSubscription: () => {
        return get().isSubscribed
      },
    }),
    {
      name: 'newsletter-storage', // unique name for localStorage
    }
  )
)