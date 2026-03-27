// pages/AdminAddProduct.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  Upload,
  X,
  Image as ImageIcon,
  Save,
  ArrowLeft
} from 'lucide-react'
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

export function AdminAddProduct() {
  const navigate = useNavigate()
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    setError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, WebP, and GIF images are allowed')
        return
      }
      
      setImageFile(file)
      // Create preview URL
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
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate form
    if (!formData.title.trim()) {
      setError('Product name is required')
      setIsLoading(false)
      return
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required')
      setIsLoading(false)
      return
    }
    
    if (!imageFile) {
      setError('Product image is required')
      setIsLoading(false)
      return
    }

    try {
      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append('title', formData.title)
      uploadData.append('price', formData.price)
      uploadData.append('description', formData.description)
      uploadData.append('categories', formData.categories || 'Uncategorized')
      uploadData.append('image', imageFile)

      const response = await api.post('/products/add', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setSuccess('Product added successfully!')
        // Reset form
        setFormData({
          title: '',
          price: '',
          description: '',
          categories: ''
        })
        setImageFile(null)
        setPreviewImage(null)
        toast({title: "Product Added Successfully"})
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/admin/products')
        }, 2000)
      }
    } catch (err: any) {
      console.error('Error adding product:', err)
      setError(err.response?.data?.error || 'Failed to add product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground mt-1">
            Add a new product to your store
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Enter the details of your new product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
               
                {/* Error Alert */}
                {/* {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )} */}

                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="title">Product Name *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter product name"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Price and Category */}
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
                      disabled={isLoading}
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

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Add Product
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>
                Upload a product image (Max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!previewImage ? (
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-primary/50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) {
                      const inputEvent = { target: { files: [file] } } as any
                      handleImageChange(inputEvent)
                    }
                  }}
                >
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-center text-sm text-muted-foreground">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPEG, PNG, WebP, GIF (Max 5MB)
                  </p>
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    className="mt-4 cursor-pointer"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
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
                    disabled={isLoading}
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