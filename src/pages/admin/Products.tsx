// pages/admin/Products.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  X,
  RefreshCw
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn, formatPrice } from '@/lib/utils'
import { api } from '@/api'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  title: string
  price: number
  description: string
  category: string
  image: string
  createdAt: string
  rating?: {
    rate: number
    count: number
  }
  stock_quantity?: number
}

export function AdminProducts() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const itemsPerPage = 10
  const { toast } = useToast()

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products')
      return data
    },
  })

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))]

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/products/${productId}`)
      return productId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['productsByCategory'] })
      queryClient.invalidateQueries({ queryKey: ['categoriesWithCounts'] }) 
      setDeleteSuccess('Product deleted successfully!')
      toast({title: 'Product deleted successfully!'})
      setTimeout(() => setDeleteSuccess(''), 3000)
    },
    onError: (error: any) => {
      setDeleteError(error.response?.data?.message || 'Failed to delete product')
      setTimeout(() => setDeleteError(''), 3000)
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      await Promise.all(productIds.map(id => api.delete(`/products/${id}`)))
      return productIds
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['productsByCategory'] })
      queryClient.invalidateQueries({ queryKey: ['categoriesWithCounts'] })
      setSelectedProducts([])
      setDeleteSuccess(`${selectedProducts.length} products deleted successfully!`)
      toast({title: 'Products deleted successfully!'})
      setTimeout(() => setDeleteSuccess(''), 3000)
    },
    onError: (error: any) => {
      setDeleteError(error.response?.data?.message || 'Failed to delete products')
      setTimeout(() => setDeleteError(''), 3000)
    }
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(search.toLowerCase()) ||
      product.id?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(paginatedProducts.map((p) => p.id))
    }
  }

  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleDelete = () => {
    if (selectedProducts.length > 1) {
      bulkDeleteMutation.mutate(selectedProducts)
    } else if (currentProduct) {
      deleteMutation.mutate(currentProduct.id)
    }
    setIsDeleteModalOpen(false)
    setCurrentProduct(null)
  }

  const handleEdit = (product: Product) => {
    navigate(`/admin/products/edit/${product.id}`)
  }

  const handleView = (productId: string) => {
    navigate(`/products/${productId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Alert variant="destructive" className="text-sm">
          <AlertDescription>
            Failed to load products. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} className="mt-4 text-sm" size="sm">
          <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Products</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Manage your product inventory - {products.length} total products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 sm:h-9 text-xs sm:text-sm">
            <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={() => navigate('/admin/add-products')} size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8 sm:pl-10 text-sm h-8 sm:h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-sm">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-lg border bg-card p-3 sm:p-4"
        >
          <p className="text-xs sm:text-sm">
            <span className="font-medium">{selectedProducts.length}</span> products selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="h-7 sm:h-8 text-xs"
            >
              <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Delete Selected</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Products Table - Desktop */}
      <Card className="hidden md:block">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-sm">Product</TableHead>
                <TableHead className="text-sm">Category</TableHead>
                <TableHead className="text-sm">Price</TableHead>
                <TableHead className="text-sm">Created</TableHead>
                <TableHead className="text-right text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={product.image} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-sm">
                          {product.title?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(product.id)} className="text-sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)} className="text-sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive text-sm"
                          onClick={() => {
                            setCurrentProduct(product)
                            setIsDeleteModalOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                    No products found. Click "Add Product" to create your first product.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Product Cards */}
      <div className="block md:hidden space-y-3">
        {paginatedProducts.map((product) => (
          <Card key={product.id} className="p-3">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedProducts.includes(product.id)}
                onCheckedChange={() => handleSelectProduct(product.id)}
                className="mt-1"
              />
              <Avatar className="h-14 w-14 rounded-lg shrink-0">
                <AvatarImage src={product.image} />
                <AvatarFallback className="rounded-lg bg-primary/10">
                  {product.title?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm line-clamp-2">{product.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">ID: {product.id}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(product.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setCurrentProduct(product)
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {product.category}
                  </Badge>
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Added: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        ))}
        {paginatedProducts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No products found.</p>
            <Button onClick={() => navigate('/admin/add-products')} variant="link" size="sm" className="mt-2">
              Add your first product
            </Button>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={cn(
                  currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                  "h-8 w-8 sm:h-9 sm:w-9"
                )}
              />
            </PaginationItem>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum = i + 1
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i
                if (pageNum > totalPages) return null
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                    className="h-8 w-8 sm:h-9 sm:w-9 text-sm"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={cn(
                  currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                  "h-8 w-8 sm:h-9 sm:w-9"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[calc(100%-32px)] mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Product</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete {selectedProducts.length > 1 ? 'these products' : `"${currentProduct?.title}"`}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} size="sm">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} size="sm">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}