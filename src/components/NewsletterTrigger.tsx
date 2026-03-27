import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Mail, Gift } from 'lucide-react'
import { NewsletterModal } from './NewsletterModal'
import { useNewsletter } from '@/hooks/useNewsletter'

export function NewsletterTrigger() {
  const { isSubscribed } = useNewsletter()
  const [isOpen, setIsOpen] = useState(false)
  const [showFloatingButton, setShowFloatingButton] = useState(false)

  useEffect(() => {
    const neverShow = localStorage.getItem('newsletter_never_show')
    
    // Show popup after 5 seconds if not subscribed and not opted out
    if (!isSubscribed && !neverShow) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
    
    // Show floating button after scroll
    const handleScroll = () => {
      if (window.scrollY > 300 && !isSubscribed) {
        setShowFloatingButton(true)
      } else {
        setShowFloatingButton(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSubscribed])

  // Don't show floating button if already subscribed
  if (isSubscribed) return null

  return (
    <>
      {/* Floating Action Button */}
      {showFloatingButton && !isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="shadow-lg group relative overflow-hidden"
            size="lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Gift className="size-5" />
              Get 10% Off
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            />
          </Button>
        </motion.div>
      )}
      
      <NewsletterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}