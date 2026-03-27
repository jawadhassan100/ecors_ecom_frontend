import { Link } from 'react-router-dom'
import { Heart, ArrowRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { useFavoritesStore } from '@/store'

export function Favorites() {
  const { items, clearFavorites } = useFavoritesStore()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-24 items-center justify-center rounded-full bg-secondary">
            <Heart className="size-12 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">
            No favorites yet
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start adding products you love to your favorites list.
          </p>
          <Button asChild className="mt-8">
            <Link to="/products">
              Browse Products
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          <p className="mt-2 text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your favorites
          </p>
        </div>
        <Button variant="ghost" onClick={clearFavorites}>
          <Trash2 className="mr-2 size-4" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
