import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Eye, Search, X, Minus, Plus, Facebook, Linkedin, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useCartStore, useFavoritesStore } from '@/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
// import { useToast } from '@/components/ui/toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const isFav = isFavorite(String(product.id))

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
     toast({
    title: "Added to cart 🛒",
    description: product.title,
  })
    setIsQuickViewOpen(false)
  }

  const handleAddToCartWithQuantity = () => {
    addItem({ ...product, quantity })
    setIsQuickViewOpen(false)
     toast({
    title: "Added to cart 🛒",
    description: `${product.title} (x${quantity})`,
  })
    setQuantity(1)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleFavorite(product)
      toast({
    title: isFav ? "Removed from favorites 💔" : "Added to favorites ❤️",
    description: product.title,
  })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsQuickViewOpen(true)
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  return (
    <>
       <Card
      className="group card-hover relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE SECTION */}
      <CardHeader className="p-0">
        <div className="relative">
          <Link to={`/products/${product.id}`}>
            <div className="aspect-square overflow-hidden bg-white p-3 sm:p-4">
              <img
                src={product.image}
                alt={product.title}
                className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* ❤️ Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 sm:right-2 sm:top-2 bg-white/80 backdrop-blur-sm hover:bg-white h-7 w-7 sm:h-8 sm:w-8"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`size-4 sm:size-5 ${
                isFav
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
      </CardHeader>

      {/* CONTENT SECTION */}
      <CardContent className="p-3 sm:p-4">
        <Badge variant="secondary" className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs capitalize px-1.5 py-0.5 sm:px-2 sm:py-0.5">
          {product.category}
        </Badge>

        <Link to={`/products/${product.id}`}>
          <h3 className="mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm font-medium leading-tight text-foreground hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        <p className="text-base sm:text-lg font-bold text-foreground mb-2 sm:mb-3">
          {formatPrice(product.price)}
        </p>
           <motion.div
      className=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex gap-1.5 sm:gap-2 w-full">
        <Button
          className="flex-1  gap-1 sm:gap-2 bg-primary text-white hover:bg-primary/90 rounded-md transition-shadow text-xs sm:text-sm h-8 sm:h-10"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="size-3 sm:size-4" />
          Add
        </Button>

        <Button
          variant="outline"
          className="bg-white text-primary border border-primary hover:bg-primary/10 rounded-md transition-shadow h-8 w-8 sm:h-10 sm:w-10 p-0"
          onClick={handleQuickView}
        >
          <Eye className="size-3 sm:size-4" />
        </Button>
      </div>
    </motion.div>
      </CardContent>
      
    </Card>

      {/* Quick View Dialog - Mobile Responsive */}
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl overflow-hidden p-0 rounded-xl sm:rounded-2xl mx-auto"
         style={{ animationDuration: '400ms' }}>
          <DialogTitle className="sr-only">Quick View - {product.title}</DialogTitle>
          
          <div className="flex flex-col md:grid md:grid-cols-2">
            {/* Left Column - Image */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 dark:from-gray-900 dark:to-gray-800">
              <div className="sticky top-0">
                <div className="group relative aspect-square overflow-hidden rounded-lg">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* View Details Overlay on Hover */}
                  <Link to={`/products/${product.id}`}>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Button variant="secondary" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Eye className="size-3 sm:size-4" />
                        View Details
                      </Button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="flex flex-col p-4 sm:p-6 md:p-8 max-h-[70vh] overflow-y-auto">
              {/* Category */}
              <Badge className="mb-2 sm:mb-3 w-fit bg-primary/10 text-primary text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2">
                {product.category}
              </Badge>

              {/* Title */}
              <h2 className="mb-1.5 sm:mb-2 text-lg sm:text-2xl font-bold leading-tight line-clamp-2">
                {product.title}
              </h2>

              {/* Price */}
              <div className="mb-3 sm:mb-4">
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Description */}
             <div className="mb-4 sm:mb-6">
  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-3 sm:line-clamp-4">
    {product.description || "Experience premium quality with this exceptional product."}
  </p>
  {product.description && product.description.split(' ').length > 30 && (
    <Link 
      to={`/products/${product.id}`}
      className="text-xs sm:text-sm text-primary hover:underline font-medium mt-1 inline-block"
      onClick={() => setIsQuickViewOpen(false)}
    >
      Read more
    </Link>
  )}
</div>

              {/* Quantity Selector */}
              <div className="mb-4 sm:mb-6">
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium">Quantity:</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Minus className="size-3 sm:size-4" />
                  </Button>
                  <span className="w-10 sm:w-12 text-center text-base sm:text-lg font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Plus className="size-3 sm:size-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button 
                size="default"
                className="mb-4 sm:mb-6 gap-2 bg-gradient-to-r from-primary to-primary/90 py-5 sm:py-6 text-sm sm:text-lg font-semibold shadow-lg transition-all hover:shadow-xl"
                onClick={handleAddToCartWithQuantity}
              >
                <ShoppingCart className="size-4 sm:size-5" />
                ADD TO CART - {formatPrice(product.price * quantity)}
              </Button>

              {/* Product Info */}
              <div className="border-t pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Category:</span> {product.category}
                </p>
              </div>

              {/* Share Buttons */}
              <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-medium">Share:</span>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-blue-50 hover:text-blue-600">
                    <Facebook className="size-3 sm:size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-sky-50 hover:text-sky-600">
                    <Twitter className="size-3 sm:size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-blue-50 hover:text-blue-800">
                    <Linkedin className="size-3 sm:size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}