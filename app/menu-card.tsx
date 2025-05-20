"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { useTheme } from "next-themes"
import { Search, Utensils, Menu, Sun, Moon, Coffee, Pizza, Soup } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductModal from "@/components/menu/product-modal"
import SidebarMenu from "@/components/menu/sidebar-menu"
import HamburgerMenu from "@/components/menu/hamburger-menu"
import OffersPage from "@/components/menu/offers-page"
// import ScratchCardsPage from "@/components/menu/scratch-cards-page"
import FeedbackPage from "@/components/menu/feedback-page"
import MinimalForm from "@/components/menu/minimal-form"
import { API_BASE_URL, IMAGE_BASE_URL, VEG_ONLY_ID, NON_VEG_ID } from "@/constants"

// Import types
import type { Product } from "@/types/menu"

// Skeleton components
const ProductSkeleton = () => (
  <div className="flex bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm relative overflow-hidden animate-pulse">
    <div className="relative min-w-[90px] h-[90px] md:min-w-[100px] md:h-[100px] mr-4">
      <div className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </div>
    <div className="flex-1 pt-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>
)

const CategorySkeleton = () => (
  <div className="mb-10 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  </div>
)

// API functions
async function fetchOutletById(outletId: string) {
  const response = await fetch(`${API_BASE_URL}/website/outlet-management/get-outlet-by-id/${outletId}`)
  if (!response.ok) throw new Error("Could not fetch outlet")
  const data = await response.json()
  return data.data || null
}

async function fetchCategories(websiteId: string) {
  const response = await fetch(`${API_BASE_URL}/website/category/get-all-categories/${websiteId}`)
  if (!response.ok) throw new Error("Could not fetch categories")
  const data = await response.json()
  return data.data || []
}

async function fetchFoodItems(websiteId: string) {
  const response = await fetch(`${API_BASE_URL}/website/food-items/get-all-food-items/${websiteId}`)
  if (!response.ok) throw new Error("Could not fetch food items")
  const data = await response.json()
  return data.data || []
}

async function fetchFeatureTypes(websiteId: string) {
  const response = await fetch(`${API_BASE_URL}/website/feature-type/get-feature-types/${websiteId}`)
  if (!response.ok) throw new Error("Could not fetch feature types")
  const data = await response.json()
  return data.data?.featureTypes || []
}

function getInitials(title: string | null): string {
  if (!title) return ""
  const words = title.split(" ")
  return words.length >= 2
    ? (words[0]?.[0] || "").toUpperCase() + (words[1]?.[0] || "").toUpperCase()
    : (words[0]?.[0] || "").toUpperCase()
}

interface MenuCardProps {
  websiteId: string
  outletId: string
}

export default function MenuCard({ websiteId, outletId }: MenuCardProps) {
  const { theme, setTheme } = useTheme()
  const [outlet, setOutlet] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [foodItems, setFoodItems] = useState<any[]>([])
  const [featureTypes, setFeatureTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showVegOnly, setShowVegOnly] = useState(false)
  const [showNonVegOnly, setShowNonVegOnly] = useState(false)
  const [showEggOnly, setShowEggOnly] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [isFixed, setIsFixed] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isMobile, setIsMobile] = useState(false)
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [hasUserData, setHasUserData] = useState(false)
  const featureTypeColors: Record<string, string> = {
    "New Arrivals": "#FF7A00",
    Recommended: "#9C27B0",
    "Gluten Free": "#2196F3",
    "Jain Food": "#4CAF50",
    "Best Seller": "#F44336",
    "Chef's Special": "#009688",
    "Today's Pick": "#673AB7",
    Spicy: "#3F51B5",
    "Low Calorie": "#00BCD4",
    Organic: "#8BC34A",
    Vegan: "#CDDC39",
    "Keto Friendly": "#FFC107",
    "High Protein": "#FF5722",
    "Sugar Free": "#795548",
    "Dairy Free": "#9E9E9E",
    "Nut Free": "#607D8B",
    "Low Carb": "#E91E63",
    Seasonal: "#1E88E5",
    "House Special": "#43A047",
    Popular: "#FB8C00",
  }

  // Check for user data in localStorage on component mount
  useEffect(() => {
    try {
      // Check if greeting card has already been shown in this session
      const greetingShown = sessionStorage.getItem(`greetingShown_${websiteId}`)

      if (greetingShown) {
        console.log("Greeting card already shown in this session")
        setShowForm(false)
        return
      }

      // First check if we have data for this specific website ID
      const storageKey = `userData_${websiteId}`
      const storedUserData = localStorage.getItem(storageKey)

      if (storedUserData) {
        console.log("Found user data for current website ID")
        setHasUserData(true)
        // Show the form with greeting card since it hasn't been shown yet in this session
        setShowForm(true)
        return
      }

      // If no data for current website ID, check for ANY user data
      let foundUserData = null
      let foundWebsiteId = null

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userData_")) {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              foundUserData = JSON.parse(data)
              foundWebsiteId = key.replace("userData_", "")
              console.log(`Found user data from different website ID: ${foundWebsiteId}`, foundUserData)
              break
            } catch (e) {
              console.error(`Error parsing data for ${key}:`, e)
            }
          }
        }
      }

      if (foundUserData) {
        // We found data from a different website ID, show form with greeting card
        setShowForm(true)
      } else {
        // No user data found anywhere, show the regular form
        setShowForm(true)
      }
    } catch (error) {
      console.error("Error retrieving user data from localStorage:", error)
      setShowForm(true)
    }
  }, [websiteId])

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isSidebarOpen || isHamburgerOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
    return () => document.body.classList.remove("overflow-hidden")
  }, [isSidebarOpen, isHamburgerOpen])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch outlet data
        const outletData = await fetchOutletById(outletId)
        setOutlet(outletData)

        // Fetch all categories
        const allCategoriesData = await fetchCategories(websiteId)

        // Filter categories to only include those in the outlet and sort by priority
        const outletCategories = outletData?.categories || []
        const filteredCategories = outletCategories
          .map((outletCat: any) => {
            if (!outletCat?.categoryId?._id) return null
            const category = allCategoriesData.find((cat: any) => cat?._id === outletCat?.categoryId?._id)
            if (!category) return null
            return {
              ...category,
              priority: outletCat.priority || 999, // Use 999 as default priority if not specified
            }
          })
          .filter(Boolean) // Remove any undefined or null entries
          .sort((a: any, b: any) => a.priority - b.priority) // Sort by priority (ascending)

        setCategories(filteredCategories)

        // Fetch food items
        const foodItemsData = await fetchFoodItems(websiteId)

        // Filter food items for this outlet
        const outletFoodItems = foodItemsData.filter((item: any) => {
          return item?.outletPrices?.some((price: any) => price?.outlet?._id === outletId)
        })

        // Fetch feature types
        const featureTypesData = await fetchFeatureTypes(websiteId)
        setFeatureTypes(featureTypesData || [])

        // Add badges only to items that have a featured_type_Id
        const foodItemsWithBadges = outletFoodItems
          .map((item: any) => {
            if (!item) return null

            // Find the feature type for this item if it exists
            const featureType = featureTypesData?.find((ft: any) => ft?._id === item?.featured_type_Id)

            if (featureType && featureType.title) {
              const featureTitle = featureType.title as string
              return {
                ...item,
                badge: featureTitle,
                badgeColor: featureTypeColors[featureTitle] || "#FF7A00", // Default to orange if no color mapping
              }
            }
            return item
          })
          .filter(Boolean) // Remove any null items

        setFoodItems(foodItemsWithBadges)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setIsLoading(false)
        // Set empty arrays to prevent further errors
        setCategories([])
        setFoodItems([])
        setFeatureTypes([])
      }
    }

    if (outletId && websiteId) {
      loadData()
    }
  }, [outletId, websiteId])

  const getProductCount = (categoryId: string | null) => {
    if (!foodItems) return 0
    if (!categoryId) return foodItems?.length || 0
    return foodItems?.filter((item) => item?.categoryId === categoryId)?.length || 0
  }

  const handleCategoryClick = (id: string | null) => {
    setSelectedCategoryId(id)
    setIsSidebarOpen(false)
  }

  const applyFilters = (item: any) => {
    // Filter by veg/non-veg/egg
    if (showVegOnly && item.food_type !== "Veg-Only") return false
    if (showNonVegOnly && (item.food_type === "Veg-Only" || item.food_type.includes("Egg"))) return false
    if (showEggOnly && !item.food_type.includes("Egg")) return false

    // Filter by search term
    if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false

    // Filter by category
    if (selectedCategoryId && item.categoryId !== selectedCategoryId) return false

    // Filter by tab
    if (activeTab !== "all" && item.badge !== activeTab) return false

    return true
  }

  const filteredFoodItems = foodItems.filter(applyFilters)

  // Group food items by category
  const groupedFoodItems = filteredFoodItems.reduce(
    (acc, item) => {
      const category = categories.find((cat) => cat._id === item.categoryId)
      const categoryName = category ? category.name : "Other"
      const priority = category ? category.priority : 999 // Use priority from category or default to 999

      if (!acc[categoryName]) {
        acc[categoryName] = {
          items: [],
          priority: priority,
        }
      }

      acc[categoryName].items.push(item)
      return acc
    },
    {} as Record<string, { items: any[]; priority: number }>,
  )

  // Sort the grouped items by priority
  const sortedGroupedItems = Object.entries(groupedFoodItems)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .map(([group, data]) => [group, data.items])

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
      if (window.scrollY > 100) {
        setIsFixed(true)
      } else {
        setIsFixed(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle product click to show modal
  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  // Get icon component based on name
  const getIconComponent = (iconName: string, size = 24) => {
    switch (iconName) {
      case "utensils":
        return <Utensils size={size} />
      case "pizza":
        return <Pizza size={size} />
      case "coffee":
        return <Coffee size={size} />
      case "soup":
        return <Soup size={size} />
      default:
        return <Utensils size={size} />
    }
  }

  // Get price for this outlet
  const getOutletPrice = (item: any) => {
    if (!item?.outletPrices) return 0
    const outletPrice = item.outletPrices.find((price: any) => price?.outlet?._id === outletId)
    return outletPrice ? outletPrice.price : 0
  }

  // Convert API food item to product format
  const convertToProduct = (item: any): Product => {
    return {
      _id: item._id,
      title: item.name,
      description: item.description,
      price: getOutletPrice(item),
      imageUrl: item.image,
      isVeg: item.food_type === "Veg-Only",
      foodType: item.food_type, // Add this line to pass the food_type
      numbers: { numberOne: getOutletPrice(item) },
      arrays: { arrayOne: item.image ? [item.image] : [] },
      featureType: item.food_type === "Veg-Only" ? VEG_ONLY_ID : NON_VEG_ID,
      logo: "",
      subCategory: { _id: item.categoryId, name: "" },
      superSubCategory: { _id: "", name: "" },
      badge: item.badge || null,
      badgeColor: item.badgeColor || null, // Pass the badge color to the product
      videoUrl: item.video || null,
    }
  }

  // Replace the existing toggle handlers with these:
  const handleVegToggle = () => {
    setShowVegOnly(!showVegOnly)
    if (!showVegOnly) {
      setShowNonVegOnly(false)
      setShowEggOnly(false)
    }
  }

  const handleNonVegToggle = () => {
    setShowNonVegOnly(!showNonVegOnly)
    if (!showNonVegOnly) {
      setShowVegOnly(false)
      setShowEggOnly(false)
    }
  }

  const handleEggToggle = () => {
    setShowEggOnly(!showEggOnly)
    if (!showEggOnly) {
      setShowVegOnly(false)
      setShowNonVegOnly(false)
    }
  }

  // Handle image error with proper type checking
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, name: string) => {
    const target = e.currentTarget
    target.style.display = "none"

    // Get the parent element and safely cast it
    const parent = target.parentElement
    if (parent) {
      // Create a div element to replace the image
      const div = document.createElement("div")
      div.className =
        "w-full h-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl md:text-2xl font-semibold text-orange-800 dark:text-orange-300"
      div.textContent = getInitials(name)

      // Append the new div to the parent
      parent.appendChild(div)
    }
  }

  // Handle user form submission
  const handleUserFormSubmit = () => {
    // Mark that greeting has been shown in this session
    sessionStorage.setItem(`greetingShown_${websiteId}`, "true")
    setShowForm(false)
    setHasUserData(true)
  }

  return (
    <div className="bg-white dark:bg-[#090e17] min-h-screen text-gray-900 dark:text-gray-100">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Floating Menu Button */}
        <div className="fixed right-6 bottom-8 z-30">
          <button
            className="bg-orange-600 hover:bg-orange-700 transition-colors w-16 h-16 rounded-full flex flex-col justify-center items-center text-white shadow-lg"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Open menu"
          >
            <Utensils size={24} />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>

        {/* Sidebar Menu */}
        <SidebarMenu
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          subCategories={categories.map((cat) => ({ _id: cat._id, name: cat.name }))}
          selectedSubCategoryId={selectedCategoryId}
          onCategoryClick={handleCategoryClick}
          getProductCount={getProductCount}
          productsCount={foodItems.length}
        />

        {/* Hamburger Menu */}
        <HamburgerMenu
          isOpen={isHamburgerOpen}
          onClose={() => setIsHamburgerOpen(false)}
          onSectionSelect={setActiveSection}
        />

        {/* Section Content Overlays */}
        {activeSection === "offers" && (
          <OffersPage
            onClose={() => setActiveSection("")}
            getIconComponent={getIconComponent}
            isMobile={isMobile}
            websiteId={websiteId}
          />
        )}

        {/* Feedback */}
        {activeSection === "feedback" && <FeedbackPage onClose={() => setActiveSection("")} websiteId={websiteId} />}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductModal
            product={convertToProduct(selectedProduct)}
            isOpen={showProductModal}
            onClose={() => setShowProductModal(false)}
            IMAGE_BASE_URL={IMAGE_BASE_URL}
          />
        )}

        {/* Only Search Bar is Sticky */}
        <div
          className={`bg-white dark:bg-[#090e17] transition-all duration-300 py-4 ${
            isFixed ? "fixed top-0 left-0 right-0 shadow-md dark:shadow-gray-800 z-10 px-4" : ""
          } ${isFixed && !isSearchVisible ? "-translate-y-full" : "translate-y-0"}`}
        >
          <div className="max-w-6xl mx-auto">
            {/* Search Bar with Hamburger Menu and Theme Toggle */}
            <div className="relative flex items-center">
              <button
                onClick={() => setIsHamburgerOpen(true)}
                className="mr-3 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <div className="absolute inset-y-0 left-10 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search for a dish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-100 dark:bg-[#2a3446] w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
              />
              <div className="ml-3">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Non-sticky Filters and Tabs */}
        <div className={`pt-4 ${isFixed ? "mt-20" : ""}`}>
          {/* Filters */}
          <div className="w-full md:hidden overflow-x-auto touch-pan-x pb-2 mb-4 scrollbar-hide">
            <div className="flex gap-3 pr-4 w-max">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 whitespace-nowrap">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={showVegOnly} onChange={handleVegToggle} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-green-600 after:peer-checked:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <span className="text-xs font-medium dark:text-white">Veg Only</span>
              </div>

              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 whitespace-nowrap">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNonVegOnly}
                    onChange={handleNonVegToggle}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-red-600 after:peer-checked:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <span className="text-xs font-medium dark:text-white">Non-Veg</span>
              </div>

              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 whitespace-nowrap">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={showEggOnly} onChange={handleEggToggle} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-yellow-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-yellow-600 after:peer-checked:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
                <span className="text-xs font-medium dark:text-white">Egg Only</span>
              </div>
            </div>
          </div>

          {/* Desktop filters */}
          <div className="hidden md:flex flex-wrap gap-3 mb-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showVegOnly} onChange={handleVegToggle} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-green-600 after:peer-checked:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
              <span className="text-sm font-medium dark:text-white">Veg Only</span>
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNonVegOnly}
                  onChange={handleNonVegToggle}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-red-600 after:peer-checked:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
              <span className="text-sm font-medium dark:text-white">Non-Veg</span>
            </div>

            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showEggOnly} onChange={handleEggToggle} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-yellow-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-yellow-600 after:peer-checked:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
              <span className="text-sm font-medium dark:text-white">Egg Only</span>
            </div>
          </div>

          {/* Tabs - Mobile scrollable, desktop full width */}
          <div className="w-full mb-6">
            {/* Mobile tabs - scrollable */}
            <div className="md:hidden w-full overflow-x-auto touch-pan-x pb-2 scrollbar-hide">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-max h-10 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <TabsTrigger
                    value="all"
                    className="rounded-lg text-xs px-4 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                  >
                    All
                  </TabsTrigger>
                  {featureTypes.map((feature) => (
                    <TabsTrigger
                      key={feature._id}
                      value={feature.title}
                      className="rounded-lg text-xs px-4 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                    >
                      {feature.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Desktop tabs - full width */}
            <div className="hidden md:block">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 justify-between overflow-x-auto">
                  <TabsTrigger
                    value="all"
                    className="flex-1 rounded-lg text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                  >
                    All
                  </TabsTrigger>
                  {featureTypes.map((feature) => (
                    <TabsTrigger
                      key={feature._id}
                      value={feature.title}
                      className="flex-1 rounded-lg text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white whitespace-nowrap"
                    >
                      {feature.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Menu Content */}
          <div className="pt-4">
            {isLoading ? (
              // Show skeletons while loading
              <>
                <CategorySkeleton />
                <CategorySkeleton />
              </>
            ) : sortedGroupedItems.length > 0 ? (
              sortedGroupedItems.map(([group, items]) => (
                <div key={group} className="mb-10">
                  <h2
                    className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-700 pb-2 mb-6`}
                  >
                    {group}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="flex bg-white dark:bg-[#090e17] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer"
                        onClick={() => handleProductClick(item)}
                      >
                        {/* Food Image */}
                        <div className="relative min-w-[90px] h-[90px] md:min-w-[100px] md:h-[100px] mr-4">
                          {item.image ? (
                            <div className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden">
                              <img
                                src={`${IMAGE_BASE_URL}${item.image}`}
                                onError={(e) => handleImageError(e, item.name)}
                                className="w-full h-full object-cover"
                                alt={item.name || "Food item"}
                              />
                            </div>
                          ) : (
                            <div className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl md:text-2xl font-semibold text-orange-800 dark:text-orange-300">
                              {getInitials(item.name)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 relative pt-2">
                          {/* Badge */}
                          {item.badge && (
                            <div
                              className="relative -top-2 ml-2 !w-fit -left-2 z-[1] text-white text-[9px] md:text-[10px] font-bold py-0.5 px-1.5 rounded-md shadow-sm"
                              style={{ backgroundColor: item.badgeColor || "#FF7A00" }}
                            >
                              <span className="whitespace-nowrap">{item.badge}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-1">
                            <h3
                              className={`${
                                isMobile ? "text-sm" : "text-base"
                              } font-semibold text-gray-800 dark:text-white pr-6 capitalize leading-tight`}
                            >
                              {item.name}
                            </h3>

                            {/* Veg/Non-veg/Egg Indicator */}
                            {item.food_type === "Veg-Only" ? (
                              <div className="w-4 h-4 md:w-5 md:h-5 border border-green-600 dark:border-green-500 flex items-center justify-center flex-shrink-0">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-600 dark:bg-green-500 rounded-full"></div>
                              </div>
                            ) : item.food_type.includes("Egg") ? (
                              <div className="w-4 h-4 md:w-5 md:h-5 border border-amber-500 dark:border-amber-400 flex items-center justify-center flex-shrink-0">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-4 h-4 md:w-5 md:h-5 border border-red-600 dark:border-red-500 flex items-center justify-center flex-shrink-0">
                                <div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 dark:bg-red-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div
                            className={`${isMobile ? "text-sm" : "text-base"} font-bold text-orange-600 dark:text-orange-500 mb-2`}
                          >
                            ₹{getOutletPrice(item)}
                          </div>
                          {/* Description */}
                          {item.description && (
                            <div
                              className={`text-gray-600 dark:text-gray-400 ${isMobile ? "text-xs" : "text-sm"} leading-tight`}
                            >
                              <div className="line-clamp-2">{item.description}</div>
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
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No items found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="py-6 text-center border-t border-gray-200 dark:border-gray-800 mt-10">
            <a
              href="https://www.technolitics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <span className="font-normal">Powered by </span>
              <span className="font-semibold">Technolitics</span>
            </a>
          </div>
        </div>
        {showForm && (
          <MinimalForm
            onSubmit={handleUserFormSubmit}
            onClose={() => setShowForm(false)}
            websiteId={websiteId} // Explicitly pass the websiteId prop
          />
        )}
      </div>
    </div>
  )
}
