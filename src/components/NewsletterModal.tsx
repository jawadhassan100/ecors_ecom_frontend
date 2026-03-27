import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Send, CheckCircle, Gift, Star, Sparkles, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useNewsletter } from '@/hooks/useNewsletter'
import { useNewsletterStore } from '@/store/newsletterStore'

interface NewsletterModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const { isSubscribed: globalSubscribed, subscribe } = useNewsletterStore()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [dontShowAgain, setDontShowAgain] = useState(false)

 // Check if user has already subscribed
  useEffect(() => {
    if (globalSubscribed) {
      setIsSubscribed(true)
    }
    
    const neverShow = localStorage.getItem('newsletter_never_show')
    if (neverShow === 'true') {
      onClose()
    }
  }, [globalSubscribed, onClose])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    if (!email.match(/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/)) {
      setError('Please enter a valid email address')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    // Simulate API call
    setTimeout(() => {
       subscribe(email)


      if (dontShowAgain) {
        localStorage.setItem('newsletter_never_show', 'true')
      }
      setIsSubscribed(true)
      setIsSubmitting(false)
      
      // Auto close after 3 seconds on success
      setTimeout(() => {
        onClose()
      }, 3000)
    }, 1500)
  }

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('newsletter_never_show', 'true')
    }
    onClose()
  }

   if (globalSubscribed) return null    

  return (
    <AnimatePresence>
       {isOpen && !isSubscribed && !globalSubscribed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50   flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full mr-5 max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-gray-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-purple-500/10 to-pink-500/5 rounded-full blur-3xl" />
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="size-5 text-gray-500" />
            </button>

            <div className="relative p-8">
              {/* Icon and Title */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-full blur-xl opacity-60" />
                  <div className="relative bg-gradient-to-r from-primary to-purple-600 p-4 rounded-full shadow-lg">
                    <Mail className="size-8 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-center text-foreground"
              >
                Join Our Newsletter
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-center text-muted-foreground"
              >
                Get exclusive offers, early access to sales, and expert tips straight to your inbox.
              </motion.p>

              {/* Benefits List */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 space-y-2 hidden sm:block"
              >
                {[
                  { icon: Gift, text: "10% off your first order" },
                  { icon: Star, text: "Exclusive member-only deals" },
                  { icon: Sparkles, text: "New product announcements" },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <benefit.icon className="size-4 text-primary" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Form */}
              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onSubmit={handleSubscribe}
                className="mt-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-red-500"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dontShowAgain"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="dontShowAgain" className="text-sm text-muted-foreground cursor-pointer">
                    Don't show this again
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="size-4" />
                        </motion.div>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        Subscribe Now
                        <Send className="size-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"
                    initial={{ x: "-100%" }}
                    animate={{ x: isSubmitting ? "0%" : "-100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </Button>
              </motion.form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-xs text-center text-muted-foreground"
              >
                No spam, ever. Unsubscribe anytime.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {isOpen && isSubscribed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 text-center">
                {/* Animated Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60"
                    />
                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full shadow-lg">
                      <CheckCircle className="size-8 text-white" />
                    </div>
                  </div>
                </motion.div>


                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-foreground"
                >
                  You're Subscribed! 🎉
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 text-muted-foreground"
                >
                  Thank you for subscribing to our newsletter. Get ready for amazing offers!
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6"
                >
                  <Button onClick={onClose} className="w-full">
                    Continue Shopping
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}