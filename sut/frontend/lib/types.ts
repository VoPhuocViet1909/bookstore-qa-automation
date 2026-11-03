export interface Book {
  id: string
  title: string
  author: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  description: string
  inStock: boolean
  discount?: number
}

export interface FilterOptions {
  categories: string[]
  priceRange: [number, number]
  ratings: number[]
  sortBy: "newest" | "price-low" | "price-high" | "rating" | "popular"
}
