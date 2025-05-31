"use client"
import type React from "react"
import { useState,useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface ProductCardProps {
  product: any
  isMobile: boolean
  onProductClick: (product: any) => void
  IMAGE_BASE_URL: string
}

function getInitials(title: string | null): string {
  if (!title) return ""
  const words = title.split(" ")
  return words.length >= 2
    ? (words[0]?.[0] || "").toUpperCase() + (words[1]?.[0] || "").toUpperCase()
    : (words[0]?.[0] || "").toUpperCase()
}

export default function ProductCard({ product, isMobile, onProductClick, IMAGE_BASE_URL }: ProductCardProps) {

  const [isTruncated, setIsTruncated] = useState(true);

const toggleReadMore = () => {
  setIsTruncated(!isTruncated);
};
  // Remove this line:
  // const [isExpanded, setIsExpanded] = useState(false)

  // Change the toggleReadMore function to open the modal instead of expanding the description
  // Replace the existing toggleReadMore function with this:

  const toggleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    onProductClick(product) // Open the modal instead of expanding description
  }

  return (
    <div
      className="flex bg-white dark:bg-[#090e17] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      {/* Food Image with Badge */}
      <div className="relative min-w-[90px] h-[90px] md:min-w-[100px] md:h-[100px] mr-4">
        {product.arrays?.arrayOne?.[0] ? (
          <div className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden">
            <img
              src={`${IMAGE_BASE_URL}${product.arrays.arrayOne[0]}`}
              alt={product.title || "Food item"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl md:text-2xl font-semibold text-orange-800 dark:text-orange-300">
            {getInitials(product.title)}
          </div>
        )}
      </div>

      <div className="flex-1 relative pt-2">
        {/* Product Details */}
        {product.badge && (
          <div
            className={`relative -top-2 ml-2 !w-fit -left-2 z-[1] ${
              product.badge === "bestseller"
                ? "bg-[#FF7A00]"
                : product.badge === "todayspick"
                  ? "bg-purple-500"
                  : product.badge === "chefspecial"
                    ? "bg-blue-500"
                    : "bg-pink-500"
            } text-white text-[9px] md:text-[10px] font-bold py-0.5 px-1.5 rounded-md shadow-sm`}
          >
            <span className="whitespace-nowrap">
              {product.badge === "bestseller"
                ? "Best Seller"
                : product.badge === "todayspick"
                  ? "Today's Pick"
                  : product.badge === "chefspecial"
                    ? "Chef's Special"
                    : "Recommended"}
            </span>
          </div>
        )}
        <div className="flex justify-between items-start mb-1">
          <h3
            className={`${
              isMobile ? "text-sm" : "text-base"
            } font-semibold text-gray-800 dark:text-white pr-6 capitalize leading-tight`}
          >
            {product.title?.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase()) || "Untitled"}
          </h3>

          {/* Veg/Non-veg Indicator - Fixed size */}
          {product.featureType === "666a87cda9d9239927d47193" ? (
            <div className="w-4 h-4 md:w-5 md:h-5 border border-green-600 dark:border-green-500 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-green-600 dark:bg-green-500 rounded-full"></div>
            </div>
          ) : (
            <div className="w-4 h-4 md:w-5 md:h-5 border border-red-600 dark:border-red-500 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 dark:bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
        <div className={`${isMobile ? "text-sm" : "text-base"} font-bold text-orange-600 dark:text-orange-500 mb-2`}>
          ₹{product.numbers?.numberOne}
        </div>
        {/* Description with Read More */}
    
            {product.description && (
  <div className={`text-gray-600 dark:text-gray-400 ${isMobile ? "text-xs" : "text-sm"} leading-tight`}>
    {/* Container for the full description (hidden when truncated) */}
    {!isTruncated && (
      <div 
        dangerouslySetInnerHTML={{ __html: product.description }}
        className="description-content"
      />
    )}
    
    {/* Container for the truncated version (shown when truncated) */}
    {isTruncated && (
      <div className="relative">
        <div 
          dangerouslySetInnerHTML={{ __html: product.description }}
          className="description-content overflow-hidden"
          style={{
            maxHeight: isMobile ? '60px' : '80px',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent dark:from-gray-900 dark:to-transparent"></div>
      </div>
    )}
    
    {/* Read more/less button */}
    <button
      onClick={toggleReadMore}
      className={`mt-1 text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium inline-flex items-center ${
        isMobile ? "text-xs" : "text-sm"
      }`}
    >
      {isTruncated ? 'Read more' : 'Read less'} 
      <ChevronDown 
        size={isMobile ? 12 : 16} 
        className={`ml-0.5 transition-transform ${isTruncated ? '' : 'rotate-180'}`} 
      />
    </button>
  </div>
)}
    


      </div>
    </div>
  )
}
