// pages/AdminDashboard.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Tag,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/api'

interface Product {
  _id: string
  title: string
  name?: string
  price: number
  category: string
  stock?: number
  createdAt: string
}

interface Category {
  _id: string
  name: string
  count: number
}

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const productsRes = await api.get('/products')
      setProducts(productsRes.data.products || productsRes.data || [])
      console.log(productsRes.data)
      
      const categoriesRes = await api.get('/products/categories/with-counts')
      setCategories(categoriesRes.data || [])
      
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const totalProducts = products.length
  const totalCategories = categories.length
  const totalValue = products.reduce((sum, product) => sum + product.price, 0)
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0
  
  const statCards = [
    {
      title: 'Total Products',
      value: totalProducts.toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'bg-purple-500',
      description: 'Products in store'
    },
    {
      title: 'Total Categories',
      value: totalCategories.toLocaleString(),
      change: '+2',
      trend: 'up',
      icon: Layers,
      color: 'bg-blue-500',
      description: 'Categories'
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-green-500',
      description: 'Inventory value'
    },
    {
      title: 'Avg. Price',
      value: `$${averagePrice.toFixed(2)}`,
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'Per product'
    },
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Welcome to your admin dashboard. Manage your products and categories here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={refreshing}
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <RefreshCw className={cn("h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/add-products'}
            size="sm"
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="py-2 sm:py-3">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards - Grid responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
                  <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn('rounded-lg p-1.5 sm:p-2', stat.color, 'bg-opacity-10')}>
                    <Icon className={cn('h-3 w-3 sm:h-4 sm:w-4', stat.color.replace('bg-', 'text-'))} />
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                  <div className="mt-1 flex items-center text-[10px] sm:text-xs">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="mr-0.5 sm:mr-1 h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-0.5 sm:mr-1 h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
                    )}
                    <span className={cn('font-medium', stat.trend === 'up' ? 'text-green-500' : 'text-red-500')}>
                      {stat.change}
                    </span>
                    <span className="ml-0.5 sm:ml-1 text-muted-foreground hidden sm:inline">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">Categories</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your product categories and their item counts
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Manage Categories</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((category) => (
                <Card key={category._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{category.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                          {category.count} {category.count === 1 ? 'product' : 'products'}
                        </p>
                      </div>
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ml-2">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-4" />
              <p className="text-xs sm:text-sm text-muted-foreground">No categories found</p>
              <Button variant="link" size="sm" className="mt-1 sm:mt-2 text-xs">
                Create your first category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table - Mobile friendly */}
      <Card>
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg">Products</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your products - {products.length} total products
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/products'} className="h-7 sm:h-8 text-xs">
              <span className="hidden sm:inline">View All Products</span>
              <span className="sm:hidden">View All</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 pt-0">
          {products.length > 0 ? (
            <>
              {/* Desktop Table - Hidden on mobile */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Price</TableHead>
                      <TableHead className="text-xs">Date Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 5).map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium text-sm">{product.title || product.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(product.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards - Visible on mobile */}
              <div className="block sm:hidden space-y-3">
                {products.slice(0, 5).map((product) => (
                  <Card key={product._id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.title || product.name}</h4>
                        <Badge variant="secondary" className="mt-1 text-xs">{product.category}</Badge>
                        <p className="text-sm font-bold mt-1">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                      Added: {formatDate(product.createdAt)}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-4" />
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">No products found</p>
              <Button onClick={() => window.location.href = '/admin/add-products'} size="sm" className="text-xs">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats - Responsive grid */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
            <CardDescription className="text-xs">Latest updates in your store</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {products.slice(0, 3).map((product) => (
                <div key={product._id} className="flex items-center justify-between border-b pb-2 sm:pb-3 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs w-20 sm:w-full sm:text-sm truncate">{product.title || product.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Added on {formatDate(product.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] sm:text-xs ml-2 shrink-0">New</Badge>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-2 sm:py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-1.5 sm:space-y-2">
            <Button 
              onClick={() => window.location.href = '/admin/add-products'}
              variant="outline" 
              className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add New Product
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/settings'}
              variant="outline" 
              className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
            >
              <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Manage Credentials
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/products'}
              variant="outline" 
              className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              View All Products
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Loading Skeleton - Responsive
function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Skeleton className="h-7 sm:h-10 w-32 sm:w-48" />
          <Skeleton className="mt-1 sm:mt-2 h-3 sm:h-4 w-48 sm:w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 sm:h-10 w-16 sm:w-24" />
          <Skeleton className="h-8 sm:h-10 w-16 sm:w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <Skeleton className="h-5 sm:h-8 w-16 sm:w-32" />
              <Skeleton className="mt-1 sm:mt-2 h-2 sm:h-4 w-24 sm:w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4">
          <Skeleton className="h-4 sm:h-6 w-24 sm:w-32" />
          <Skeleton className="h-3 sm:h-4 w-32 sm:w-64" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="space-y-2 sm:space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1 sm:space-y-2">
                  <Skeleton className="h-3 sm:h-5 w-24 sm:w-32" />
                  <Skeleton className="h-2 sm:h-4 w-16 sm:w-24" />
                </div>
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}