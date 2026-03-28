import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  Heart,
  Shield,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore, useFavoritesStore } from '@/store'
import { formatPrice } from '@/lib/utils'

export function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const { addFavorite } = useFavoritesStore()

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleMoveToFavorites = (product: any) => {
    addFavorite(product)
    removeItem(product.id)
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="flex size-24 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="size-12 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven't added any items to your cart yet.
          </p>
          


          <Button asChild className="mt-8">
            <Link to="/products">
              Start Shopping
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="divide-y p-0">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-4 p-4 sm:p-6"
                  >
                    {/* Image */}
                    <Link
                      to={`/products/${item.product.id}`}
                      className="shrink-0"
                    >
                      <div className="size-24 overflow-hidden rounded-lg bg-white p-2 transition-all hover:scale-105 sm:size-32">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="size-full object-contain"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                         <Link
  to={`/products/${item.product.id}`}
  className="block max-w-[220px] font-medium text-foreground hover:text-primary line-clamp-2"
>
  {item.product.title}
</Link>
                          <p className="mt-1 text-sm capitalize text-muted-foreground">
                            {item.product.category}
                          </p>
                        </div>
                        <p className="font-bold text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        {/* Quantity */}
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveToFavorites(item.product)}
                            className="text-muted-foreground hover:text-pink-500"
                          >
                            <Heart className="mr-1 size-4" />
                            Save
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-1 size-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Shopping Tips */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 text-sm">
                <Shield className="size-5 text-primary" />
                <span>Secure checkout powered by industry-standard encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Preview */}
              <div className="max-h-48 space-y-3 overflow-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-white p-1">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="size-full object-contain"
                      />
                      <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                   <div className="flex-1 min-w-0 text-sm">
  <p className="font-medium line-clamp-2">
    {item.product.title}
  </p>
</div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {shipping === 0 ? (
                <div className="rounded-md bg-green-50 p-3 text-center text-sm text-green-700">
                  <Truck className="mx-auto mb-1 size-4" />
                  You qualify for free shipping!
                </div>
              ) : (
                <div className="rounded-md bg-blue-50 p-3 text-center text-sm text-blue-700">
                  Add {formatPrice(50 - subtotal)} more for free shipping
                </div>
              )}

              {/* Promo Code */}
              <div className="pt-2">
                <p className="mb-2 text-sm font-medium">Have a promo code?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}