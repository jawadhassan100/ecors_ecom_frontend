// pages/admin/AdminEditProduct.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  Upload,
  X,
  Save,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/api'
import { useToast } from '@/hooks/use-toast'


export function AdminEditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    categories: ''
  })

  // Fetch product data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`)
      return data
    },
    enabled: !!id,
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updateData: FormData) => {
      const { data } = await api.put(`/products/${id}`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
       queryClient.invalidateQueries({ queryKey: ['categories'] })
       queryClient.invalidateQueries({ queryKey: ['productsByCategory'] })
       queryClient.invalidateQueries({ queryKey: ['categoriesWithCounts'] })
      setSuccess('Product updated successfully!')
      setTimeout(() => {
        navigate('/admin/products')
      }, 2000)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update product')
    },
  })

  // Populate form when product data is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        categories: product.category || ''
      })
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, WebP, and GIF images are allowed')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setPreviewImage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title.trim()) {
      setError('Product name is required')
      return
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required')
      return
    }

    const updateData = new FormData()
    updateData.append('title', formData.title)
    updateData.append('price', formData.price)
    updateData.append('description', formData.description)
    updateData.append('categories', formData.categories || 'Uncategorized')
    if (imageFile) {
      updateData.append('image', imageFile)
    }
    toast({title: "Product Updated!"})
    updateMutation.mutate(updateData)
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-1">
            Update product information
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Update the details of your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
               

                {/* {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )} */}

                <div className="space-y-2">
                  <Label htmlFor="title">Product Name *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter product name"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categories">Category</Label>
                    <Select 
                      value={formData.categories} 
                      onValueChange={(value) => setFormData({ ...formData, categories: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Health and Household">Health and Household</SelectItem>
                        <SelectItem value="Beauty and Personal Care">Beauty and Personal Care</SelectItem>
                        <SelectItem value="Home and Kitchen">Home and Kitchen</SelectItem>
                        <SelectItem value="Home Decor">Home Decor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    disabled={updateMutation.isPending}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Product
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>
                Upload a new product image (Max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!previewImage && product?.image ? (
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-auto max-h-[400px] w-full rounded-lg object-contain"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
                      input.onchange = (e) => handleImageChange(e as any)
                      input.click()
                    }}
                    disabled={updateMutation.isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change Image
                  </Button>
                </div>
              ) : !previewImage ? (
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-primary/50 cursor-pointer"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
                    input.onchange = (e) => handleImageChange(e as any)
                    input.click()
                  }}
                >
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-center text-sm text-muted-foreground">
                    Click to upload a new image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPEG, PNG, WebP, GIF (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Product preview"
                    className="h-auto max-h-[400px] w-full rounded-lg object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={removeImage}
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}