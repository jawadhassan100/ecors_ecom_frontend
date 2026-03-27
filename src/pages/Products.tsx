import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  Star,
  ChevronDown,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Tag,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCartStore, useFavoritesStore } from '@/store'
import { formatPrice, cn } from '@/lib/utils'
import { api } from '@/api/axios'
import type { Product } from '@/types'

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'name'
type ViewMode = 'grid' | 'list'
type SaleFilter = 'all' | 'on-sale' | 'featured'

const ITEMS_PER_PAGE = 12

interface Filters {
  categories: string[]
  priceRange: [number, number]
  sale: SaleFilter
  search: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

function FilterSection({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string
  children: React.ReactNode
  defaultOpen?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 font-medium"
      >
        {title}
        <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="pt-2">{children}</div>}
    </div>
  )
}

function FilterSidebar({
  filters,
  onFiltersChange,
  categories,
  maxPrice,
  onClearAll,
}: {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  categories: string[]
  maxPrice: number
  onClearAll: () => void
}) {
  const activeCount = filters.categories.length + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0) +
    (filters.sale !== 'all' ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear ({activeCount})
          </Button>
        )}
      </div>

      <FilterSection title="Categories">
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => {
                  onFiltersChange({
                    ...filters,
                    categories: checked
                      ? [...filters.categories, category]
                      : filters.categories.filter((c) => c !== category),
                  })
                }}
              />
              <Label htmlFor={`cat-${category}`} className="capitalize text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
            min={0}
            max={maxPrice}
            step={1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Special Offers">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sale-on-sale"
              checked={filters.sale === 'on-sale'}
              onCheckedChange={(checked) => {
                onFiltersChange({
                  ...filters,
                  sale: checked ? 'on-sale' : 'all',
                })
              }}
            />
            <Label htmlFor="sale-on-sale" className="flex items-center gap-2 cursor-pointer">
              <Tag className="size-4 text-red-600" />
              <span>On Sale</span>
              <Badge variant="outline" className="text-xs">Save up to 50%</Badge>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="sale-featured"
              checked={filters.sale === 'featured'}
              onCheckedChange={(checked) => {
                onFiltersChange({
                  ...filters,
                  sale: checked ? 'featured' : 'all',
                })
              }}
            />
            <Label htmlFor="sale-featured" className="flex items-center gap-2 cursor-pointer">
              <TrendingUp className="size-4 text-blue-600" />
              <span>Featured Products</span>
            </Label>
          </div>
        </div>
      </FilterSection>
    </div>
  )
}

function ProductCardGrid({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const isFav = isFavorite(String(product.id))
  const isOnSale = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.regular_price)

  return (
    <Card className="group overflow-hidden relative">
      {isOnSale && (
        <Badge className="absolute left-2 top-2 z-10 bg-red-500 text-white">
          SALE
        </Badge>
      )}
      <CardHeader className="relative p-0">
        <Link to={`/products/${product.id}`}>
          <div className="aspect-square bg-white p-4">
            <img src={product.image} alt={product.title} className="size-full object-contain" />
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 bg-background/80"
          onClick={() => toggleFavorite(product)}
        >
          <Heart className={cn('size-5', isFav ? 'fill-red-500 text-red-500' : '')} />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2 text-xs capitalize">{product.category}</Badge>
        <Link to={`/products/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-medium hover:text-primary">{product.title}</h3>
        </Link>
        {/* <div className="mb-2 flex items-center gap-1">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-muted-foreground">{product.rating?.rate || 0}</span>
        </div> */}
        <div className="flex items-center gap-2">
          {isOnSale ? (
            <>
              <p className="text-lg font-bold text-red-600">{formatPrice(parseFloat(product.sale_price))}</p>
              <p className="text-sm text-muted-foreground line-through">{formatPrice(parseFloat(product.regular_price))}</p>
            </>
          ) : (
            <p className="text-lg font-bold">{formatPrice(product.price)}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => addItem(product)}>
          <ShoppingCart className="mr-2 size-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

function ProductCardList({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const isFav = isFavorite(String(product.id))
  const isOnSale = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.regular_price)

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {isOnSale && (
        <Badge className="absolute left-2 top-2 z-10 bg-red-500 text-white">
          SALE
        </Badge>
      )}
      
      {/* Mobile layout (default) */}
      <div className="block md:hidden">
        {/* Image section for mobile */}
        <div className="relative w-full">
          <Link to={`/products/${product.id}`}>
            <div className="aspect-square bg-white p-4">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-contain" 
              />
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-background/80 hover:bg-background"
            onClick={() => toggleFavorite(product)}
          >
            <Heart className={cn('size-5', isFav ? 'fill-red-500 text-red-500' : '')} />
          </Button>
        </div>
        
        {/* Content section for mobile */}
        <div className="p-4">
          <Badge variant="secondary" className="mb-2 w-fit text-xs capitalize">
            {product.category}
          </Badge>
          <Link to={`/products/${product.id}`}>
            <h3 className="mb-2 text-lg font-medium hover:text-primary line-clamp-2">
              {product.title}
            </h3>
          </Link>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">
              {product.rating?.rate || 0} ({product.rating?.count || 0})
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              {isOnSale ? (
                <>
                  <p className="text-xl font-bold text-red-600">
                    {formatPrice(parseFloat(product.sale_price))}
                  </p>
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(parseFloat(product.regular_price))}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold">{formatPrice(product.price)}</p>
              )}
            </div>
            <Button 
              onClick={() => addItem(product)}
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="mr-2 size-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop layout (md and above) */}
      <div className="hidden md:flex">
        <div className="relative w-48 shrink-0">
          <Link to={`/products/${product.id}`}>
            <div className="h-full bg-white p-4">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-contain" 
              />
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-background/80 hover:bg-background"
            onClick={() => toggleFavorite(product)}
          >
            <Heart className={cn('size-5', isFav ? 'fill-red-500 text-red-500' : '')} />
          </Button>
        </div>
        <div className="flex-1 p-4">
          <Badge variant="secondary" className="mb-2 w-fit text-xs capitalize">
            {product.category}
          </Badge>
          <Link to={`/products/${product.id}`}>
            <h3 className="mb-2 text-lg font-medium hover:text-primary line-clamp-2">
              {product.title}
            </h3>
          </Link>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">
              {product.rating?.rate || 0} ({product.rating?.count || 0})
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {isOnSale ? (
                <>
                  <p className="text-xl font-bold text-red-600">
                    {formatPrice(parseFloat(product.sale_price))}
                  </p>
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(parseFloat(product.regular_price))}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold">{formatPrice(product.price)}</p>
              )}
            </div>
            <Button onClick={() => addItem(product)}>
              <ShoppingCart className="mr-2 size-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function ProductSkeleton({ view }: { view: ViewMode }) {
  if (view === 'list') {
    return (
      <Card className="flex flex-col sm:flex-row overflow-hidden">
        <Skeleton className="w-full sm:w-48 aspect-square" />
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between pt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>
    )
  }
  return (
    <Card>
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  )
}

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const initialCategory = searchParams.get('category')
  const [filters, setFilters] = useState<Filters>({
    categories: initialCategory ? [initialCategory] : [],
    priceRange: [0, 1000],
    sale: 'all',
    search: searchParams.get('search') ?? '',
  })

  const debouncedFilters = useDebounce(filters, 300)

  const { data: products, isLoading, isFetching } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/products')
      return data
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<string[]>('/products/categories/with-counts')
      return data.map((cat: any) => cat.name || cat._id)
    },
    staleTime: 10 * 60 * 1000,
  })

  const maxPrice = useMemo(() => {
    if (!products) return 1000
    return Math.ceil(Math.max(...products.map((p) => p.price)))
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    let result = [...products]

    // Filter by categories
    if (debouncedFilters.categories.length > 0) {
      result = result.filter((p) =>
        debouncedFilters.categories.some((c) => p.category.toLowerCase() === c.toLowerCase())
      )
    }
    
    // Filter by search
    if (debouncedFilters.search) {
      const q = debouncedFilters.search.toLowerCase()
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    
    // Filter by price range
    result = result.filter((p) => p.price >= debouncedFilters.priceRange[0] && p.price <= debouncedFilters.priceRange[1])
    
    // Filter by sale/featured
    if (debouncedFilters.sale === 'on-sale') {
      result = result.filter((p) => p.sale_price && parseFloat(p.sale_price) < parseFloat(p.regular_price))
    } else if (debouncedFilters.sale === 'featured') {
      // You can implement featured logic - maybe based on rating > 4.5 or custom field
      result = result.filter((p) => p.rating?.rate >= 4.5)
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'rating': result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0)); break
      case 'name': result.sort((a, b) => a.title.localeCompare(b.title)); break
      default: result.sort((a, b) => b.id - a.id)
    }
    return result
  }, [products, debouncedFilters, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  useEffect(() => setCurrentPage(1), [debouncedFilters, sortBy])

  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = []
    
    filters.categories.forEach((cat) => {
      chips.push({ 
        key: `cat-${cat}`, 
        label: cat, 
        onRemove: () => setFilters((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== cat) })) 
      })
    })
    
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) {
      chips.push({ 
        key: 'price', 
        label: `${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`, 
        onRemove: () => setFilters((prev) => ({ ...prev, priceRange: [0, maxPrice] })) 
      })
    }
    
    if (filters.sale === 'on-sale') {
      chips.push({ 
        key: 'sale', 
        label: 'On Sale', 
        onRemove: () => setFilters((prev) => ({ ...prev, sale: 'all' })) 
      })
    }
    
    if (filters.sale === 'featured') {
      chips.push({ 
        key: 'featured', 
        label: 'Featured Products', 
        onRemove: () => setFilters((prev) => ({ ...prev, sale: 'all' })) 
      })
    }
    
    if (filters.search) {
      chips.push({ 
        key: 'search', 
        label: `"${filters.search}"`, 
        onRemove: () => setFilters((prev) => ({ ...prev, search: '' })) 
      })
    }
    
    return chips
  }, [filters, maxPrice])

  const handleClearAll = () => {
    setFilters({ categories: [], priceRange: [0, maxPrice], sale: 'all', search: '' })
    setSearchParams({})
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="mt-2 text-muted-foreground">
          Showing {paginatedProducts.length} of {filteredProducts.length} products
          {isFetching && !isLoading && ' (Updating...)'}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, search: e.target.value }))
              if (e.target.value) searchParams.set('search', e.target.value)
              else searchParams.delete('search')
              setSearchParams(searchParams)
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Name: A-Z</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden sm:flex border rounded-md">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="size-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
              <List className="size-4" />
            </Button>
          </div>
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 size-4" />
                Filters
                {activeFilters.length > 0 && <Badge className="ml-2" variant="secondary">{activeFilters.length}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-6">
                <FilterSidebar filters={filters} onFiltersChange={setFilters} categories={categories} maxPrice={maxPrice} onClearAll={handleClearAll} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>
          {activeFilters.map((f) => (
            <Badge key={f.key} variant="secondary" className="capitalize">
              {f.label}
              <button onClick={f.onRemove} className="ml-1"><X className="size-3" /></button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={handleClearAll}>Clear all</Button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} categories={categories} maxPrice={maxPrice} onClearAll={handleClearAll} />
          </div>
        </aside>

        <main className="flex-1">
          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} view={viewMode} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
              <Button variant="outline" className="mt-4" onClick={handleClearAll}>Clear Filters</Button>
            </div>
          ) : viewMode === 'grid' ? (
           <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCardGrid key={product.id} product={product} />
            ))}
          </div>
          ) : (
            <div className="space-y-4">
              {paginatedProducts.map((product) => <ProductCardList key={product.id} product={product} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-4 text-sm">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}