export interface Product {
  _id: number | string
  title: string | null
  description: string | null
  price: number
  imageUrl: string | null
  isVeg: boolean
  foodType?: string // Add this line
  numbers: { numberOne: number }
  arrays: { arrayOne: string[] }
  featureType?: string
  logo: string
  subCategory: { _id: string; name: string }
  superSubCategory: { _id: string; name: string }
  badge?: string
  badgeColor?: string | null
  videoUrl?: string | null
}

export interface ScratchCardItem {
  id: number
  title: string
  discount: string
  minOrder: number
  isScratched: boolean
  lastScratchedTime?: number
  code?: string
  color: string
  icon?: string
  brand?: string
  expiryDate?: string
  details?: string[]
  value: string
  brandLogo?: string
}
