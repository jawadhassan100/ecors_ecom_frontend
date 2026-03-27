import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Truck,
  Shield,
  HeadphonesIcon,
  CreditCard,
  Laptop,
  Gem,
  Shirt,
  Watch,
  Sparkles,
  Gift,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckCircle2,
  Package,
  ArrowRightCircle,
  Crown,
  SparkleIcon,
} from 'lucide-react'
import { Home as HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/LoadingSkeletons'
import { ErrorDisplay } from '@/components/ErrorBoundary'
import { useProducts, useCategoriesWithCounts } from '@/api/hooks'
import { AboutSection } from './AboutSection'
import { useNewsletterStore } from '@/store/newsletterStore'
import type { Product } from '@/types'

// Hero Slides Data
const heroSlides = [
  {
    id: 1,
    title: 'Premium Electronics',
    subtitle: 'Discover innovative gadgets designed to simplify your life. From cutting-edge laptops to smart devices, find technology that blends seamlessly into your everyday routine, keeping you connected and productive.',
    cta: 'Shop Electronics',
    link: '/products?category=electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&h=1080&fit=crop',
    icon: Laptop,
    category: 'electronics'
  },
  {
    id: 2,
    title: 'Beautiful Home Decor',
    subtitle: 'Curated pieces to create a warm and inviting space. Explore elegant furniture, modern lighting, and artistic accents that transform your home into a personal sanctuary full of style and comfort.',
    cta: 'Explore Home Decor',
    link: '/products?category=home%20decor',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&h=1080&fit=crop',
    icon: HomeIcon,
    category: 'home decor'
  },
  {
    id: 3,
    title: 'Beauty & Personal Care',
    subtitle: 'Essentials that make self-care a simple pleasure. From premium skincare to everyday beauty products, indulge in items crafted to enhance your natural glow and keep you feeling confident every day.',
    cta: 'Shop Beauty',
    link: '/products?category=beauty%20and%20personal%20care',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920&h=1080&fit=crop',
    icon: Sparkles,
    category: 'beauty and personal care'
  },
];

// Features Data
const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free shipping on orders over $50',
    count: 10000,
    suffix: '+',
    label: 'Orders Shipped',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment processing',
    count: 99.9,
    suffix: '%',
    label: 'Secure Transactions',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Round the clock customer support',
    count: 24,
    suffix: '/7',
    label: 'Always Available',
  },
  {
    icon: CreditCard,
    title: 'Easy Returns',
    description: '30-day money back guarantee',
    count: 30,
    suffix: ' Days',
    label: 'Return Policy',
  },
]

// Function to get icon based on category name
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()
  if (name.includes('electronic') || name.includes('laptop') || name.includes('computer')) return Laptop
  if (name.includes('health and household') || name.includes('gem')) return Gem
  if (name.includes('beauty and personal care')) return Shirt
  if (name.includes('home decor')) return Sparkles
  if (name.includes('home and kitchen') || name.includes('access')) return Watch
  if (name.includes('gift')) return Gift
  return Package
}

// Function to get color based on category name
const getCategoryColor = (categoryName: string) => {
  const name = categoryName.toLowerCase()
  if (name.includes('electronics')) return 'bg-blue-500/10 text-blue-600'
  if (name.includes('health and household')) return 'bg-amber-500/10 text-amber-600'
  if (name.includes('beauty and personal care')) return 'bg-emerald-500/10 text-emerald-600'
  if (name.includes('home decor')) return 'bg-pink-500/10 text-pink-600'
  if (name.includes('home and kitchen')) return 'bg-purple-500/10 text-purple-600'
  return 'bg-red-500/10 text-red-600'
}

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

// Counter Animation Component
function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return
    const startTime = Date.now()
    const endTime = startTime + duration * 1000

    const updateCount = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(target * easeOutQuart)
      if (now < endTime) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(target)
      }
    }
    requestAnimationFrame(updateCount)
  }, [isInView, target, duration])

  return (
    <span ref={ref}>
      {target % 1 !== 0 ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  )
}

// Define Category type
interface Category {
  name: string
  productCount: number
  image?: string
  _id?: string
}

// CategoryCard component with proper types
interface CategoryCardProps {
  category: Category
  index: number
  Icon: React.ElementType
  colorClass: string
}

function CategoryCard({ category, index, Icon, colorClass }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const formatCategoryName = (name: string) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }
  
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/30 p-6 transition-all duration-300 hover:shadow-2xl">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          {/* Decorative Elements */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:scale-150" />
          
          <div className="relative z-10">
            {/* Icon Container with Animation */}
            <motion.div
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0,
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex h-20 w-20 items-center justify-center rounded-2xl ${colorClass} shadow-lg transition-all duration-300 group-hover:shadow-xl`}
            >
              <Icon className="h-10 w-10" />
            </motion.div>

            {/* Category Info */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                {formatCategoryName(category.name)}
              </h3>
              
              {/* Product Count with Icon */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                  <Package className="h-3 w-3 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {category.productCount}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {category.productCount === 1 ? 'Product' : 'Products'}
                </span>
              </div>

              {/* Shop Now Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -20 }}
                transition={{ duration: 0.3 }}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-primary"
              >
                <span>Shop Now</span>
                <ArrowRightCircle className="h-4 w-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function Home() {
  const { data: products, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts()
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategoriesWithCounts()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const bestSellersRef = useRef<HTMLDivElement>(null)
  const { isSubscribed, subscribe, unsubscribe, email: subscribedEmail } = useNewsletterStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use categories from API or empty array
  const categories: Category[] = categoriesData || []
  
  const featuredProducts = products?.slice(0, 8) ?? []
  const bestSellers = products?.slice(4, 12) ?? []

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setEmailError('Please enter your email address')
      return
    }
    
    if (!email.match(/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/)) {
      setEmailError('Please enter a valid email address')
      return
    }
    
    setIsSubmitting(true)
    setEmailError('')
    
    setTimeout(() => {
      subscribe(email)
      setIsSubmitting(false)
      setEmail('')
    }, 1000)
  }

  const handleUnsubscribe = () => {
    unsubscribe()
  }

  const scrollBestSellers = (direction: 'left' | 'right') => {
    if (bestSellersRef.current) {
      const scrollAmount = 320
      bestSellersRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const currentHero = heroSlides[currentSlide]

  // Format category name for display (capitalize each word)
  const formatCategoryName = (name: string) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <div className="flex flex-col">
      {/* Hero Wrapper */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6">
        <section className="relative h-[500px] w-full overflow-hidden rounded-md lg:h-[600px] shadow-lg">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={currentHero.image}
              alt={currentHero.title}
              className="size-full object-cover transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative flex h-full items-center">
            <div className="mx-auto w-full max-w-7xl px-6">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mx-auto max-w-2xl text-center"
              >
                <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  New Arrivals
                </span>

                <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                  {currentHero.title}
                </h1>

                <p className="mt-4 text-md sm:text-lg text-white/90">
                  {currentHero.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="group">
                    <Link to={currentHero.link}>
                      {currentHero.cta}
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  >
                    <Link to="/products">View All Products</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="border-y bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 gap-8 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex flex-col items-center rounded-xl bg-background p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="size-7 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                <div className="mt-4 border-t pt-4">
                  <span className="text-2xl font-bold text-primary">
                    <AnimatedCounter target={feature.count} suffix={feature.suffix} />
                  </span>
                  <p className="text-xs text-muted-foreground">{feature.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section - DYNAMIC FROM YOUR BACKEND */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4"
            >
              <SparkleIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Shop by Category</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Browse Our Collections
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing products across {categories.length} carefully curated categories
            </p>
          </motion.div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 rounded-2xl bg-muted" />
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <div className="text-center text-red-500 py-12">
              <p>Error loading categories. Please refresh the page.</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No categories found. Add some products to get started!</p>
            </div>
          ) : (
            <>
              {/* Featured Category (Big Card) */}
              {categories[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-12"
                >
                  <Link to={`/products?category=${encodeURIComponent(categories[0].name)}`}>
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 p-8 md:p-12">
                      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 mb-4">
                            <Crown className="h-4 w-4 text-white" />
                            <span className="text-sm font-medium text-white">Most Popular</span>
                          </div>
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {formatCategoryName(categories[0].name)}
                          </h3>
                          <p className="text-white/90 text-lg mb-4">
                            {categories[0].productCount} amazing products waiting for you
                          </p>
                          <Button variant="secondary" size="lg" className="group">
                            Explore Collection
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                        <div className="flex -space-x-4">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white"
                            >
                              {React.createElement(getCategoryIcon(categories[0].name), { className: "h-8 w-8 text-white" })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid of Categories */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {categories.slice(1).map((category, idx) => {
                  const IconComponent = getCategoryIcon(category.name)
                  const colorClass = getCategoryColor(category.name)
                  
                  return (
                    <CategoryCard
                      key={category.name}
                      category={category}
                      index={idx}
                      Icon={IconComponent}
                      colorClass={colorClass}
                    />
                  )
                })}
              </motion.div>

              {/* View All Categories Link */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="group border-2 hover:border-primary"
                >
                  <Link to="/products">
                    <span>View All Categories</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex items-center justify-between"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Products</h2>
              <p className="mt-2 text-muted-foreground">Check out our most popular items</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </motion.div>

          {productsLoading ? (
            <ProductGridSkeleton count={8} />
          ) : productsError ? (
            <ErrorDisplay error={productsError as Error} onRetry={refetchProducts} />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers Carousel */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 flex items-center justify-between"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Best Sellers</h2>
              <p className="mt-2 text-muted-foreground">Our top-rated products loved by customers</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" size="icon" onClick={() => scrollBestSellers('left')}>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Scroll left</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => scrollBestSellers('right')}>
                <ChevronRight className="size-4" />
                <span className="sr-only">Scroll right</span>
              </Button>
            </div>
          </motion.div>

          <div className="group relative">
            <div
              ref={bestSellersRef}
              className="flex gap-6 overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {productsLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="w-72 flex-shrink-0">
                    <div className="h-80 animate-pulse rounded-lg bg-muted" />
                  </div>
                ))
              ) : (
                bestSellers.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-72 flex-shrink-0"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <AboutSection/>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/90"
          >
            <div className="relative px-8 py-16 text-center">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
              </div>

              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-white/20"
                >
                  <Mail className="size-8 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white">Join Our Newsletter</h2>
                <p className="mx-auto mt-4 max-w-xl text-white/90">
                  Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
                </p>

                <AnimatePresence mode="wait">
                  {isSubscribed ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mx-auto mt-8 max-w-md"
                    >
                      <div className="rounded-lg bg-white/20 p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle2 className="size-8 text-white" />
                          <div>
                            <p className="font-semibold text-white">Thank you for subscribing!</p>
                            <p className="text-sm text-white/80">
                              {subscribedEmail ? `We've sent updates to ${subscribedEmail}` : 'Check your inbox for exclusive offers'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleUnsubscribe}
                          className="mt-3 text-white hover:bg-white/20"
                        >
                          Unsubscribe
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleSubscribe}
                      className="mx-auto mt-8 max-w-md"
                    >
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setEmailError('')
                            }}
                            disabled={isSubmitting}
                            className={`h-12 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 ${
                              emailError ? 'border-red-400 focus:border-red-400' : ''
                            }`}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          variant="secondary" 
                          size="lg" 
                          className="h-12 px-8 font-semibold"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                        </Button>
                      </div>
                      {emailError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-left text-sm text-red-200"
                        >
                          {emailError}
                        </motion.p>
                      )}
                      <p className="mt-3 text-xs text-white/60">
                        No spam, ever. Unsubscribe anytime.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}