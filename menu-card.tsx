"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Search, Menu, X, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Product {
  _id: number
  title: string | null
  description: string | null
  price: number
  imageUrl: string | null
  isVeg: boolean
  numbers: { numberOne: number }
  arrays: { arrayOne: string[] }
  featureType?: string
  logo: string
  subCategory: { _id: string; name: string }
  superSubCategory: { _id: string; name: string }
}

const API_BASE_URL = "https://api.webbuilder.technolitics.com/api/v1/website-builder"
const WEBSITE_ID = "67bd54722de90cffcd66a0c6"
const IMAGE_BASE_URL = "https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/foodmenu-websitebuilder-s3-bucket/"

async function fetchProducts(categoryId: string) {
  const response = await fetch(
    `${API_BASE_URL}/website/product-management/get-all-products/${WEBSITE_ID}?categories=${categoryId}`,
  )
  if (!response.ok) throw new Error("Could not fetch products")
  const data = await response.json()
  return data.data || []
}

async function fetchSubCategories(categoryId: string) {
  const response = await fetch(
    `${API_BASE_URL}/website/sub-category/get-all-sub-categories/${WEBSITE_ID}?categories=${categoryId}`,
  )
  if (!response.ok) throw new Error("Could not fetch subcategories")
  const data = await response.json()
  return data.data || []
}

function getInitials(title: string | null): string {
  if (!title) return ""
  const words = title.split(" ")
  return words.length >= 2
    ? (words[0]?.[0] || "").toUpperCase() + (words[1]?.[0] || "").toUpperCase()
    : (words[0]?.[0] || "").toUpperCase()
}

export default function MenuCard() {
  const { categoryId } = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [subCategories, setSubCategories] = useState<{ _id: string; name: string }[]>([])
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showVegOnly, setShowVegOnly] = useState(false)
  const [showNonVegOnly, setShowNonVegOnly] = useState(false)
  const [showEggOnly, setShowEggOnly] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [isFixed, setIsFixed] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Record<number, boolean>>({})
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => document.body.classList.remove("overflow-hidden")
  }, [isOpen])

  const toggleReadMore = (productId: number) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  useEffect(() => {
    if (categoryId) {
      const id = Array.isArray(categoryId) ? categoryId[0] : categoryId
      fetchProducts(id)
        .then((data) => {
          // Add random badges to 1/3 of products
          const productsWithBadges = data.map((product: Product, index: number) => {
            if (index % 3 === 0) {
              return {
                ...product,
                badge: Math.random() > 0.5 ? "bestseller" : "todayspick",
              }
            }
            return product
          })
          setProducts(productsWithBadges)
        })
        .catch(console.error)
      fetchSubCategories(id).then(setSubCategories).catch(console.error)
    }
  }, [categoryId])

  const getProductCount = (id: string | null) => {
    if (!id) return products?.length || 0
    return products?.filter((item) => item?.subCategory?._id === id).length || 0
  }

  const handleCategoryClick = (id: string | null) => {
    setSelectedSubCategoryId(id)
    setIsOpen(false)
  }

  const applyFilters = (product: any) => {
    // Filter by veg/non-veg/egg
    if (showVegOnly && product.featureType !== "666a87cda9d9239927d47193") return false
    if (showNonVegOnly && product.featureType === "666a87cda9d9239927d47193") return false
    if (showEggOnly) return true // Dummy egg filter for now

    // Filter by search term
    if (searchTerm && !product.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false

    // Filter by subcategory
    if (selectedSubCategoryId && product.subCategory?._id !== selectedSubCategoryId) return false

    // Filter by tab
    if (activeTab === "vegan" && product.featureType !== "666a87cda9d9239927d47193") return false
    if (activeTab === "lactoseFree") return true // Dummy filter
    if (activeTab === "glutenFree") return true // Dummy filter
    if (activeTab === "bestseller" && product.badge !== "bestseller") return false
    if (activeTab === "todayspick" && product.badge !== "todayspick") return false

    return true
  }

  const filteredProducts = products.filter(applyFilters)

  const groupedProducts = filteredProducts.reduce(
    (acc, product) => {
      const group = product.superSubCategory?.name || product.subCategory?.name || "Other"
      acc[group] = acc[group] || []
      acc[group].push(product)
      return acc
    },
    {} as Record<string, any[]>,
  )

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsSearchVisible(scrollTop <= lastScrollTop || scrollTop < 100)
      setLastScrollTop(scrollTop)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollTop])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsFixed(true)
      } else {
        setIsFixed(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Floating Menu Button */}
        <div className="fixed right-6 bottom-8 z-30">
          <button
            className="bg-orange-600 hover:bg-orange-700 transition-colors w-14 h-14 rounded-full flex flex-col justify-center items-center text-white shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>

        {/* Sidebar Menu Overlay */}
        {isOpen && <div className="fixed inset-0 bg-black/50 z-20" onClick={() => setIsOpen(false)} />}

        {/* Sidebar Menu */}
        {isOpen && (
          <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl z-30 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-orange-600">Categories</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${!selectedSubCategoryId ? "bg-orange-100 text-orange-700" : "hover:bg-gray-100"}`}
                  onClick={() => handleCategoryClick(null)}
                >
                  <div className="flex justify-between items-center">
                    <span>All Items</span>
                    <span className="text-sm text-gray-500">{products.length}</span>
                  </div>
                </button>

                {subCategories?.length > 0 &&
                  subCategories
                    .filter((sub) => sub && sub._id)
                    .map((sub) => (
                      <button
                        key={sub._id}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${selectedSubCategoryId === sub._id ? "bg-orange-100 text-orange-700" : "hover:bg-gray-100"}`}
                        onClick={() => handleCategoryClick(sub._id)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="capitalize">
                            {sub.name ? sub.name.charAt(0).toUpperCase() + sub.name.slice(1).toLowerCase() : "Unnamed"}
                          </span>
                          <span className="text-sm text-gray-500">{getProductCount(sub._id)}</span>
                        </div>
                      </button>
                    ))}
              </div>
            </div>
          </div>
        )}

        {/* Header with Search and Filters */}
        <div
          className={`bg-white transition-all duration-300 py-4 ${
            isFixed ? "fixed top-0 left-0 right-0 shadow-md z-10 px-4" : ""
          } ${isFixed && !isSearchVisible ? "-translate-y-full" : "translate-y-0"}`}
        >
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for a dish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-100 w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVegOnly}
                    onChange={() => {
                      setShowVegOnly(!showVegOnly)
                      if (!showVegOnly) setShowNonVegOnly(false)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <span className="text-sm font-medium">Veg Only</span>
              </div>

              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNonVegOnly}
                    onChange={() => {
                      setShowNonVegOnly(!showNonVegOnly)
                      if (!showNonVegOnly) setShowVegOnly(false)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <span className="text-sm font-medium">Non-Veg</span>
              </div>

              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2">
                <div className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEggOnly}
                    onChange={() => setShowEggOnly(!showEggOnly)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-yellow-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <span className="text-sm font-medium">Egg Only</span>
              </div>
            </div>

            {/* Tabs */}
          </div>
        </div>

        {/* Menu Content */}
        <div className={`pt-4 ${isFixed ? "mt-40" : ""}`}>
          {Object.entries(groupedProducts).length > 0 ? (
            Object.entries(groupedProducts).map(([group, items]) => (
              <div key={group} className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-400 pb-2 mb-6">{group}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((product: any, index: number) => (
                    <div
                      key={product._id || `product-${index}`}
                      className="flex bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      {/* Badge */}
                      {product.badge && (
                        <Badge
                          className={`absolute top-2 right-2 z-10 ${
                            product.badge === "bestseller" ? "bg-orange-500" : "bg-purple-500"
                          }`}
                        >
                          {product.badge === "bestseller" ? "Bestseller" : "Today's Pick"}
                        </Badge>
                      )}

                      {/* Food Image */}
                      <div className="relative min-w-[100px] h-[100px] mr-4">
                        {product.arrays?.arrayOne?.[0] ? (
                          <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-orange-200">
                            <img
                              src={`${IMAGE_BASE_URL}${product.arrays.arrayOne[0]}`}
                              alt={product.title || "Food item"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-[100px] h-[100px] rounded-full bg-orange-100 flex items-center justify-center text-2xl font-semibold text-orange-800">
                            {getInitials(product.title)}
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-semibold text-gray-800 pr-6 capitalize">
                            {product.title?.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase()) ||
                              "Untitled"}
                          </h3>

                          {/* Veg/Non-veg Indicator */}
                          {product.featureType === "666a87cda9d9239927d47193" ? (
                            <div className="w-5 h-5 border border-green-600 flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="w-5 h-5 border border-red-600 flex items-center justify-center">
                              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                            </div>
                          )}
                        </div>

                        <div className="text-lg font-bold text-orange-600 mb-2">₹{product.numbers?.numberOne}</div>

                        {/* Description with Read More */}
                        {product.description && (
                          <div className="text-gray-600 text-sm">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: expandedProducts[product._id]
                                  ? product.description.replace(/<\/?(p|span)[^>]*>/g, "")
                                  : (() => {
                                      const plainText = product.description.replace(/<\/?(p|span)[^>]*>/g, "")
                                      if (plainText.length <= 80) return plainText
                                      return plainText.slice(0, 80) + "..."
                                    })(),
                              }}
                              className="inline"
                            />
                            {product.description.replace(/<\/?(p|span)[^>]*>/g, "").length > 80 && (
                              <button
                                onClick={() => toggleReadMore(product._id)}
                                className="ml-1 text-orange-500 hover:text-orange-700 font-medium inline-flex items-center"
                              >
                                {expandedProducts[product._id] ? (
                                  <>
                                    Less <ChevronUp size={14} className="ml-1" />
                                  </>
                                ) : (
                                  <>
                                    Read more <ChevronDown size={14} className="ml-1" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
