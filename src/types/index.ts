export interface Product {
  id: number
  title: string
  price: number
  description: string
  regular_price: string
  quantity: number
  sale_price: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  productCount:number
  image?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  shippingAddress: ShippingAddress
  createdAt: Date
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}
