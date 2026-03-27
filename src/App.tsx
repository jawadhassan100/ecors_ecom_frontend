import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Home } from '@/pages/Home'
import { Products } from '@/pages/Products'
import { ProductDetail } from '@/pages/ProductDetail'
import { Cart } from '@/pages/Cart'
import { Checkout } from '@/pages/Checkout'
import { Favorites } from '@/pages/Favorites'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { AdminLogin } from './pages/admin/Login'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminProducts } from './pages/admin/Products'
import { AdminSettings } from './pages/admin/Settings'
import { useEffect } from 'react'
import { NewsletterTrigger } from './components/NewsletterTrigger'
import { ProtectedRoute } from './components/ProtectedRoutes'
import { AdminAddProduct } from './pages/admin/AdminAddProduct'
import { AdminEditProduct } from './pages/admin/AdminEditProduct'
import { Toaster } from './components/ui/toaster'

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
      <a
        href="/"
        className="mt-8 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go Home
      </a>
    </div>
  )
}

export default function App() {
const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className='overflow-x-hidden'>

    <ErrorBoundary>
      <Routes>
        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin Routes - Outside Layout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
<Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
<Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
<Route path="/admin/add-products" element={<ProtectedRoute><AdminAddProduct /></ProtectedRoute>} />
<Route path="/admin/products/edit/:id" element={<ProtectedRoute><AdminEditProduct /></ProtectedRoute>} />
          
          
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
        <Toaster />
      <NewsletterTrigger />
    </ErrorBoundary>
    </div>
  )
}