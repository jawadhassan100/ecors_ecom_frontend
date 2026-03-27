// hooks/useNewsletter.ts
import { useState, useEffect } from 'react'

interface NewsletterState {
  isSubscribed: boolean
  email?: string
  subscribe: (email: string) => void
  unsubscribe: () => void
  checkSubscription: () => boolean
}

export function useNewsletter(): NewsletterState {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [email, setEmail] = useState<string>()

  useEffect(() => {
    // Check localStorage on mount
    const subscribed = localStorage.getItem('newsletter_subscribed')
    const savedEmail = localStorage.getItem('newsletter_email')
    
    if (subscribed === 'true') {
      setIsSubscribed(true)
      if (savedEmail) setEmail(savedEmail)
    }
  }, [])

  const subscribe = (email: string) => {
    localStorage.setItem('newsletter_subscribed', 'true')
    localStorage.setItem('newsletter_email', email)
    setIsSubscribed(true)
    setEmail(email)
  }

  const unsubscribe = () => {
    localStorage.removeItem('newsletter_subscribed')
    localStorage.removeItem('newsletter_email')
    setIsSubscribed(false)
    setEmail(undefined)
  }

  const checkSubscription = () => {
    return localStorage.getItem('newsletter_subscribed') === 'true'
  }

  return {
    isSubscribed,
    email,
    subscribe,
    unsubscribe,
    checkSubscription,
  }
}