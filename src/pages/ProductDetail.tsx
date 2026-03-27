import { useState, useRef, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Facebook,
  Twitter,
  Link2,
  Truck,
  RotateCcw,
  Shield,
  Package,
  Check,
  ZoomIn,
  User,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Send,
  Award,
  Clock,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductDetailSkeleton } from '@/components/LoadingSkeletons'
import { ErrorDisplay } from '@/components/ErrorBoundary'
import { ProductCard } from '@/components/ProductCard'
import { useProduct, useProductsByCategory } from '@/api/hooks'
import { useCartStore, useFavoritesStore } from '@/store'
import { formatPrice, cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Generate mock images for gallery
function generateMockImages(mainImage: string) {
  return [mainImage, mainImage, mainImage, mainImage]
}

interface PendingReview {
  id: string
  author: string
  rating: number
  comment: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewName, setReviewName] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const imageRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { data: product, isLoading, error, refetch } = useProduct(id || '')
  const { data: relatedProducts } = useProductsByCategory(product?.category ?? '')

  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()

  useEffect(() => {
    const saved = localStorage.getItem(`pending_reviews_${id}`)
    if (saved) {
      setPendingReviews(JSON.parse(saved))
    }
  }, [id])

  if (isLoading) return <ProductDetailSkeleton />
  if (error) return <ErrorDisplay error={error as Error} onRetry={refetch} />
  if (!product) return <ErrorDisplay error={new Error('Product not found')} />

  const isFav = isFavorite(String(product.id))
  const images = generateMockImages(product.image)
  const inStock = product.rating?.count > 10

  const approvedReviews: any[] = []

  const handleAddToCart = () => {
    addItem(product, quantity)
    setQuantity(1)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = `Check out ${product.title}`
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      copy: url,
    }
    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const handleSubmitReview = () => {
    if (!reviewName.trim() || !reviewComment.trim()) return
    setIsSubmitting(true)
    setTimeout(() => {
      const newPendingReview: PendingReview = {
        id: Date.now().toString(),
        author: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
      }
      const updatedPending = [...pendingReviews, newPendingReview]
      setPendingReviews(updatedPending)
      localStorage.setItem(`pending_reviews_${id}`, JSON.stringify(updatedPending))
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setShowReviewForm(false)
      setReviewName('')
      setReviewComment('')
      setReviewRating(5)
      setTimeout(() => setSubmitSuccess(false), 3000)
    }, 1000)
  }

  const filteredRelatedProducts = relatedProducts?.filter((p) => p.id !== product.id).slice(0, 6) || []
  const averageRating = product.rating?.rate || 0
  const reviewCount = (product.rating?.count || 0) + pendingReviews.length

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const approvedCount = approvedReviews.filter((r: any) => r.rating === stars).length
    const pendingCount = pendingReviews.filter(r => r.rating === stars).length
    const total = approvedCount + pendingCount
    const percentage = reviewCount > 0 ? (total / reviewCount) * 100 : 0
    return { stars, count: total, percentage }
  })

  // Mobile tab options for select dropdown
  const tabOptions = [
    { value: 'description', label: 'Description' },
    { value: 'reviews', label: `Reviews (${reviewCount})` },
    { value: 'additional', label: 'Details' },
    { value: 'brand', label: 'Brand' },
    { value: 'shipping', label: 'Shipping' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb - Responsive */}
      <nav className="mb-4 sm:mb-8 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap pb-1">
        <RouterLink to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Home
        </RouterLink>
        <ChevronRight className="size-3 sm:size-4 text-muted-foreground shrink-0" />
        <RouterLink to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
          Products
        </RouterLink>
        <ChevronRight className="size-3 sm:size-4 text-muted-foreground shrink-0" />
        <RouterLink to={`/products?category=${encodeURIComponent(product.category)}`} className="capitalize text-muted-foreground hover:text-foreground transition-colors max-w-[100px] sm:max-w-none truncate">
          {product.category}
        </RouterLink>
        <ChevronRight className="size-3 sm:size-4 text-muted-foreground shrink-0" />
        <span className="truncate text-foreground font-medium max-w-[150px] sm:max-w-sm">
          {product.title}
        </span>
      </nav>

      {/* Product Details - Responsive Grid */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          <motion.div
            ref={imageRef}
            className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl border bg-gradient-to-br from-white to-gray-50 cursor-zoom-in shadow-sm"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <img
              src={images[selectedImageIndex]}
              alt={product.title}
              className="size-full object-contain p-4 sm:p-8"
              style={isZoomed ? {
                transform: 'scale(2)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              } : undefined}
            />
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 rounded-full bg-black/50 backdrop-blur-sm p-1.5 sm:p-2 text-white">
              <ZoomIn className="size-3 sm:size-5" />
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <Badge className="mb-2 sm:mb-3 bg-gradient-to-r from-primary to-primary/80 text-white border-0 text-xs sm:text-sm">
                {product.category}
              </Badge>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                {product.title}
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleFavorite(product)}
              className={cn(
                "shrink-0 transition-all h-8 w-8 sm:h-9 sm:w-9",
                isFav && "border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
              )}
            >
              <Heart className={cn("size-4 sm:size-5", isFav && "fill-current")} />
            </Button>
          </div>

          {/* Rating */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4 sm:size-5",
                    i < Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <span className="font-semibold text-base sm:text-lg">{averageRating.toFixed(1)}</span>
            <button 
              onClick={() => setActiveTab('reviews')}
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ({reviewCount} reviews)
            </button>
          </div>

          {/* Price */}
          <div className="mt-4 sm:mt-6 flex items-baseline gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
          </div>

          <Separator className="my-4 sm:my-6" />

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Quantity</Label>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center rounded-lg border shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="rounded-r-none hover:bg-secondary h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Minus className="size-3 sm:size-4" />
                </Button>
                <span className="w-10 sm:w-14 text-center font-semibold text-sm sm:text-base">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-l-none hover:bg-secondary h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Plus className="size-3 sm:size-4" />
                </Button>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{formatPrice(product.price * quantity)}</span>
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
            <Button size="default" className="flex-1 shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base py-5 sm:py-6" onClick={handleAddToCart}>
              <ShoppingCart className="mr-1 sm:mr-2 size-4 sm:size-5" />
              Add to Cart
            </Button>
            <Button size="default" variant="secondary" className="shadow-sm text-sm sm:text-base py-5 sm:py-6">
              Buy Now
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm text-muted-foreground">Share:</span>
            <div className="flex gap-1.5 sm:gap-2">
              <Button variant="outline" size="icon" className="h-7 w-7 sm:h-9 sm:w-9 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleShare('facebook')}>
                <Facebook className="size-3 sm:size-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7 sm:h-9 sm:w-9 hover:bg-sky-50 hover:text-sky-600" onClick={() => handleShare('twitter')}>
                <Twitter className="size-3 sm:size-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7 sm:h-9 sm:w-9 hover:bg-gray-50" onClick={() => handleShare('copy')}>
                <Link2 className="size-3 sm:size-4" />
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Orders over $50' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '30-day policy' },
              { icon: Shield, title: 'Secure Payment', desc: 'SSL encrypted' },
              { icon: Package, title: 'Quality Guarantee', desc: '100% authentic' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 rounded-xl border bg-gradient-to-br from-white to-gray-50 p-2 sm:p-3 hover:shadow-md transition-shadow">
                <feature.icon className="size-4 sm:size-5 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">{feature.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section - Mobile Responsive */}
      <div className="mt-8 sm:mt-12 lg:mt-16">
        {/* Mobile: Dropdown Select for Tabs */}
        <div className="block sm:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Regular Tabs */}
        <div className="hidden sm:block">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start gap-1 sm:gap-2 bg-transparent border-b rounded-none h-auto p-0 overflow-x-auto">
              {tabOptions.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content - Responsive */}
        <div className="mt-4 sm:mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="rounded-xl sm:rounded-2xl border bg-gradient-to-br from-white to-gray-50/50 p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    <MessageSquare className="size-5 sm:size-6 text-primary" />
                    Product Description
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">{product.description}</p>
                  <Separator className="my-4 sm:my-6" />
                  <h4 className="text-base sm:text-lg lg:text-xl font-medium mb-3 sm:mb-4">Key Features</h4>
                  <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    {[
                      'Premium quality materials',
                      'Carefully crafted design',
                      'Long-lasting durability',
                      'Excellent value for money',
                      'Ergonomic design',
                      'Eco-friendly packaging',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="size-4 sm:size-5 text-green-500" />
                        <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold">Customer Reviews</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {reviewCount} reviews for this product
                      </p>
                    </div>
                    <Button onClick={() => setShowReviewForm(!showReviewForm)} className="shadow-md text-sm">
                      <MessageSquare className="mr-2 size-3 sm:size-4" />
                      Write a Review
                    </Button>
                  </div>

                  {/* Review Form */}
                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl sm:rounded-2xl border bg-gradient-to-br from-white to-gray-50/50 p-4 sm:p-6">
                          <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Share Your Experience</h4>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm">Rating</Label>
                              <div className="flex gap-1 sm:gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className="focus:outline-none"
                                  >
                                    <Star className={cn(
                                      "size-6 sm:size-8 transition-all",
                                      star <= reviewRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground/30'
                                    )} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="name">Your Name</Label>
                              <Input
                                id="name"
                                placeholder="Enter your name"
                                value={reviewName}
                                onChange={(e) => setReviewName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="comment">Your Review</Label>
                              <Textarea
                                id="comment"
                                placeholder="Share your experience..."
                                rows={4}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 sm:gap-3 justify-end">
                              <Button variant="outline" onClick={() => setShowReviewForm(false)} size="sm" className="text-sm">
                                Cancel
                              </Button>
                              <Button onClick={handleSubmitReview} disabled={!reviewName.trim() || !reviewComment.trim() || isSubmitting} size="sm" className="text-sm">
                                {isSubmitting ? 'Submitting...' : (
                                  <>
                                    <Send className="mr-2 size-3 sm:size-4" />
                                    Submit Review
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {submitSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <Check className="size-4 text-green-600" />
                      <AlertDescription className="text-green-800 text-sm">
                        Thank you for your review! It will be visible after admin approval.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Rating Summary */}
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="rounded-xl sm:rounded-2xl border bg-gradient-to-br from-white to-gray-50/50 p-6 sm:p-8 text-center">
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
                      <div className="flex justify-center gap-0.5 sm:gap-1 mt-2 sm:mt-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn(
                            "size-4 sm:size-5 lg:size-6",
                            i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                          )} />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">Based on {reviewCount} reviews</p>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {ratingDistribution.map(({ stars, percentage }) => (
                        <div key={stars} className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-0.5 sm:gap-1 w-12 sm:w-16">
                            <span className="text-xs sm:text-sm">{stars}</span>
                            <Star className="size-3 sm:size-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                            />
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground w-10 sm:w-12">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {pendingReviews.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                        <Clock className="size-4 sm:size-5 text-orange-500" />
                        Pending Reviews
                      </h4>
                      {pendingReviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-dashed bg-orange-50/30 p-4 sm:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="size-8 sm:size-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <User className="size-4 sm:size-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm sm:text-base">{review.author}</span>
                                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                  <Clock className="mr-1 size-2 sm:size-3" />
                                  Awaiting Approval
                                </Badge>
                              </div>
                              <div className="flex gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn(
                                    "size-3 sm:size-4",
                                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                                  )} />
                                ))}
                              </div>
                              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{review.comment}</p>
                              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                                Submitted on {review.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info Tab */}
              {activeTab === 'additional' && (
                <div className="rounded-xl sm:rounded-2xl border bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                  <div className="grid divide-y">
                    {[
                      { label: 'Category', value: product.category, icon: Package },
                      { label: 'SKU', value: `PROD-${product.id.toString().padStart(5, '0')}`, icon: Package },
                      { label: 'Weight', value: '0.5 kg', icon: Package },
                      { label: 'Dimensions', value: '20 x 15 x 5 cm', icon: Package },
                      { label: 'Availability', value: inStock ? 'In Stock' : 'Low Stock', icon: Package },
                      { label: 'Material', value: 'Premium Quality', icon: Package },
                      { label: 'Warranty', value: '1 Year', icon: Shield },
                      { label: 'Country of Origin', value: 'Global', icon: Truck },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-2 sm:w-1/3">
                          <item.icon className="size-4 sm:size-5 text-primary" />
                          <span className="font-medium text-sm sm:text-base">{item.label}</span>
                        </div>
                        <div className="mt-1 sm:mt-0 sm:w-2/3">
                          <span className="capitalize text-xs sm:text-sm text-muted-foreground">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Tab */}
              {activeTab === 'brand' && (
                <div className="rounded-xl sm:rounded-2xl border bg-gradient-to-br from-white to-gray-50/50 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                    <div className="md:w-1/3 flex justify-center">
                      <div className="size-20 sm:size-24 lg:size-32 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Award className="size-10 sm:size-12 lg:size-16 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl sm:text-2xl font-semibold mb-2">Premium Store</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Trusted seller since 2020</p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Premium Store is dedicated to providing high-quality products at competitive prices. 
                        With a focus on customer satisfaction and product excellence.
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 mt-4 sm:mt-6">
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">4.8</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">Seller Rating</div>
                        </div>
                        <Separator orientation="vertical" className="h-8 sm:h-10 lg:h-12" />
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">10K+</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">Products Sold</div>
                        </div>
                        <Separator orientation="vertical" className="h-8 sm:h-10 lg:h-12" />
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">98%</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">Positive Reviews</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Tab */}
              {activeTab === 'shipping' && (
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { icon: Truck, title: 'Standard Shipping', desc: '5-7 business days', price: 'Free on orders over $50' },
                    { icon: Package, title: 'Express Shipping', desc: '2-3 business days', price: '$9.99' },
                    { icon: RotateCcw, title: 'Return Policy', desc: '30-day hassle-free returns', price: 'Free returns' },
                    { icon: Shield, title: 'International Shipping', desc: 'Available worldwide', price: 'Calculated at checkout' },
                  ].map((policy, i) => (
                    <div key={i} className="rounded-xl border p-3 sm:p-4 lg:p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50/30">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="size-8 sm:size-10 lg:size-12 rounded-xl flex items-center justify-center bg-primary/10">
                            <policy.icon className="size-4 sm:size-5 lg:size-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base lg:text-lg">{policy.title}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{policy.desc}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs sm:text-sm py-1 px-2 sm:px-3 w-fit">
                          {policy.price}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Related Products Carousel */}
      {filteredRelatedProducts.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  <ShoppingCart className="size-4 sm:size-5 text-primary" />
                </div>
                You Might Also Like
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Customers who bought this also bought these items
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="size-4" />
              </Button>
              <RouterLink to={`/products?category=${encodeURIComponent(product.category)}`}>
                <Button variant="ghost" size="sm" className="ml-1 sm:ml-2 text-sm">
                  View All
                  <ChevronRight className="ml-1 size-3 sm:size-4" />
                </Button>
              </RouterLink>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div
              ref={scrollContainerRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredRelatedProducts.map((relatedProduct, idx) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="min-w-[240px] sm:min-w-[260px] md:min-w-[280px]"
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="size-5 sm:size-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 sm:left-4 text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
              }}
            >
              <ChevronLeft className="size-6 sm:size-8" />
            </Button>

            <motion.img
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={images[selectedImageIndex]}
              alt={product.title}
              className="max-h-[80vh] max-w-[90vw] sm:max-w-[80vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 sm:right-4 text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
              }}
            >
              <ChevronRight className="size-6 sm:size-8" />
            </Button>

            <div className="absolute bottom-4 flex gap-1.5 sm:gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(index)
                  }}
                  className={cn(
                    "size-1.5 sm:size-2 rounded-full transition-all",
                    selectedImageIndex === index ? 'bg-white w-4 sm:w-6' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}