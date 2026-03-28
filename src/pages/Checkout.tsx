import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Truck,
  ClipboardList,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Lock,
  Shield,
  Package,
  Wallet,
  Building2,
  Smartphone,
  Badge
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Zod schemas for each step
const contactSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
})

const shippingSchema = z.object({
  address: z.string().min(5, 'Please enter a valid address'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'Please enter a valid city'),
  state: z.string().min(2, 'Please enter a valid state'),
  zipCode: z.string().min(5, 'Please enter a valid ZIP code'),
  country: z.string().min(2, 'Please enter a valid country'),
})

type ContactFormData = z.infer<typeof contactSchema>
type ShippingFormData = z.infer<typeof shippingSchema>

const steps = [
  { id: 1, name: 'Contact', icon: User },
  { id: 2, name: 'Shipping', icon: Truck },
  { id: 3, name: 'Review', icon: ClipboardList },
]

export function Checkout() {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [orderId, setOrderId] = useState('')

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  // Form for contact info
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  })

  // Form for shipping info
  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
  })

  const handleContactSubmit = (data: ContactFormData) => {
    setCurrentStep(2)
  }

  const handleShippingSubmit = (data: ShippingFormData) => {
    setCurrentStep(3)
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // Generate fake order ID
    const newOrderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    setOrderId(newOrderId)
    
    // Save order to localStorage (simulate database)
    const order = {
      id: newOrderId,
      date: new Date().toISOString(),
      customer: contactForm.getValues(),
      shipping: shippingForm.getValues(),
      items: items,
      total: total,
      status: 'processing'
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    orders.push(order)
    localStorage.setItem('orders', JSON.stringify(orders))
    
    setIsSubmitting(false)
    setIsComplete(true)
    window.scrollTo(0, 0)
    clearCart()
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Redirect to cart if empty
  if (items.length === 0 && !isComplete) {
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
            Add some items to your cart before checking out.
          </p>
          <Button asChild className="mt-8">
            <Link to="/products">
              Browse Products
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  // Order confirmation
  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-foreground">
            Order Confirmed! 
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been received.
          </p>
          
          <div className="mt-8 rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-2xl font-bold text-foreground">{orderId}</p>
              </div>
              
              <Separator />
              
              <div className="grid text-center gap-4 ">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{contactForm.getValues('email')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">{formatPrice(total)}</p>
                </div>
              </div>
              
            
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <Link to="/products">
                Continue Shopping
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-secondary text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <step.icon className="size-4" />
                )}
                <span className="hidden sm:inline">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-8 sm:w-16',
                    currentStep > step.id ? 'bg-green-500' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4" />
        <span>Secure Checkout - Your information is protected</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Contact Info */}
            {currentStep === 1 && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="size-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={contactForm.handleSubmit(handleContactSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          {...contactForm.register('email')}
                        />
                        {contactForm.formState.errors.email && (
                          <p className="text-sm text-destructive">
                            {contactForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            {...contactForm.register('firstName')}
                          />
                          {contactForm.formState.errors.firstName && (
                            <p className="text-sm text-destructive">
                              {contactForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            {...contactForm.register('lastName')}
                          />
                          {contactForm.formState.errors.lastName && (
                            <p className="text-sm text-destructive">
                              {contactForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(123) 456-7890"
                          {...contactForm.register('phone')}
                        />
                        {contactForm.formState.errors.phone && (
                          <p className="text-sm text-destructive">
                            {contactForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit">
                          Continue to Shipping
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="size-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Main Street"
                          {...shippingForm.register('address')}
                        />
                        {shippingForm.formState.errors.address && (
                          <p className="text-sm text-destructive">
                            {shippingForm.formState.errors.address.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="apartment">
                          Apartment, suite, etc. (optional)
                        </Label>
                        <Input
                          id="apartment"
                          placeholder="Apt 4B"
                          {...shippingForm.register('apartment')}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            {...shippingForm.register('city')}
                          />
                          {shippingForm.formState.errors.city && (
                            <p className="text-sm text-destructive">
                              {shippingForm.formState.errors.city.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State / Province</Label>
                          <Input
                            id="state"
                            placeholder="NY"
                            {...shippingForm.register('state')}
                          />
                          {shippingForm.formState.errors.state && (
                            <p className="text-sm text-destructive">
                              {shippingForm.formState.errors.state.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                          <Input
                            id="zipCode"
                            placeholder="10001"
                            {...shippingForm.register('zipCode')}
                          />
                          {shippingForm.formState.errors.zipCode && (
                            <p className="text-sm text-destructive">
                              {shippingForm.formState.errors.zipCode.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="United States"
                            {...shippingForm.register('country')}
                          />
                          {shippingForm.formState.errors.country && (
                            <p className="text-sm text-destructive">
                              {shippingForm.formState.errors.country.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={goBack}>
                          <ArrowLeft className="mr-2 size-4" />
                          Back
                        </Button>
                        <Button type="submit">
                          Review Order
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-6">
                  {/* Contact Summary */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Contact Information</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                      >
                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="font-medium">
                        {contactForm.getValues('firstName')}{' '}
                        {contactForm.getValues('lastName')}
                      </p>
                      <p className="text-muted-foreground">
                        {contactForm.getValues('email')}
                      </p>
                      <p className="text-muted-foreground">
                        {contactForm.getValues('phone')}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Shipping Summary */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Shipping Address</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                      >
                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="font-medium">
                        {shippingForm.getValues('address')}
                        {shippingForm.getValues('apartment') &&
                          `, ${shippingForm.getValues('apartment')}`}
                      </p>
                      <p className="text-muted-foreground">
                        {shippingForm.getValues('city')},{' '}
                        {shippingForm.getValues('state')}{' '}
                        {shippingForm.getValues('zipCode')}
                      </p>
                      <p className="text-muted-foreground">
                        {shippingForm.getValues('country')}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-4"
                          >
                            <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-white p-2">
                              <img
                                src={item.product.image}
                                alt={item.product.title}
                                className="size-full object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium line-clamp-1">
                                {item.product.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} x {formatPrice(item.product.price)}
                              </p>
                            </div>
                            <p className="font-medium">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method (Dummy) */}
                 <Card>
  <CardHeader>
    <CardTitle className="text-base">Payment Method</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {/* Credit Card Option */}
      <div className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary cursor-pointer transition-colors">
        <CreditCard className="size-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="font-medium">Credit / Debit Card</p>
          <p className="text-sm text-muted-foreground">
            Visa, Mastercard, American Express
          </p>
          
        </div>
        <div className="h-5 w-5 rounded-full border-2 border-primary">
          <div className="h-3 w-3 rounded-full bg-primary m-[2px]"></div>
        </div>
      </div>



      <Separator className="my-2" />

      {/* Secure Payment Notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Lock className="size-3" />
        <span>100% Secure Payment.</span>
      </div>
    </div>
  </CardContent>
</Card>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={goBack}>
                      <ArrowLeft className="mr-2 size-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order
                          <Package className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary Sidebar */}
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
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
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

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}