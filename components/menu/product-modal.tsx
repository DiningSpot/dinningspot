"use client"
import { useRef, useEffect, useState } from "react"
import type React from "react"

import { X, Star } from "lucide-react"

interface ProductModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
  IMAGE_BASE_URL: string
}

function getInitials(title: string | null): string {
  if (!title) return ""
  const words = title.split(" ")
  return words.length >= 2
    ? (words[0]?.[0] || "").toUpperCase() + (words[1]?.[0] || "").toUpperCase()
    : (words[0]?.[0] || "").toUpperCase()
}

export default function ProductModal({ product, isOpen, onClose, IMAGE_BASE_URL }: ProductModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [windowHeight, setWindowHeight] = useState(0)
  const [isRounded, setIsRounded] = useState(true)

  // Check if device is mobile and get window dimensions
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setWindowHeight(window.innerHeight)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Reset rounded state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsRounded(true)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  // Extract YouTube video ID from different URL formats
  const getYouTubeVideoId = (url?: string) => {
    if (!url) return null

    // Trim any whitespace from the URL
    const trimmedUrl = url.trim()

    // Handle YouTube Shorts format
    const shortsRegex = /youtube\.com\/shorts\/([^?&\s]+)/
    let match = trimmedUrl.match(shortsRegex)
    if (match) return match[1]

    // Handle standard YouTube URL format
    const standardRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    match = trimmedUrl.match(standardRegex)
    return match ? match[1] : null
  }

  // Check if product has a video
  const videoId = product.videoUrl ? getYouTubeVideoId(product.videoUrl) : null
  const hasVideo = !!videoId

  // Get badge color based on badge type
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "bestseller":
        return "bg-[#FF7A00]"
      case "todayspick":
        return "bg-purple-500"
      case "chefspecial":
        return "bg-blue-500"
      case "recommended":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get badge text based on badge type
  const getBadgeText = (badge: string) => {
    switch (badge) {
      case "bestseller":
        return "Best Seller"
      case "todayspick":
        return "Today's Pick"
      case "chefspecial":
        return "Chef's Special"
      case "recommended":
        return "Recommended"
      default:
        return badge
    }
  }

  // Handle scroll event to change border radius based on scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    // Calculate the maximum scrollable distance
    const maxScroll = scrollHeight - clientHeight

    // Calculate scroll percentage (0 to 100)
    const scrollPercentage = (scrollTop / maxScroll) * 100

    // Change border radius at 50% scroll
    if (scrollPercentage >= 50 && isRounded) {
      setIsRounded(false)
    } else if (scrollPercentage < 50 && !isRounded) {
      setIsRounded(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Separate backdrop div with blur */}
      <div className="fixed inset-0 bg-black/20 dark:bg-white/10 backdrop-blur-[7px]" onClick={onClose} />

      {/* Modal content */}
      <div className="fixed inset-0 flex items-end justify-center pointer-events-none">
        <div
          ref={modalRef}
          className={`bg-transparent w-full overflow-y-auto pointer-events-auto ${
            isMobile ? "max-h-[100vh]" : "max-w-2xl rounded-xl shadow-2xl max-h-[90vh] self-center"
          }`}
          onScroll={handleScroll}
        >
          {/* Spacer div that takes up 30% of viewport height - clickable to close modal */}
          {isMobile && <div style={{ height: "30vh" }} className="bg-transparent cursor-pointer" onClick={onClose} />}

          <div
            ref={contentRef}
            className={`relative bg-white dark:bg-[#090e17] ${
              isMobile ? (isRounded ? "rounded-t-[18px]" : "rounded-t-none") : "rounded-xl"
            } transition-all duration-200`}
          >
            {/* Close Button - Only visible on desktop */}
            {!isMobile && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-1 z-10"
              >
                <X size={24} className="text-gray-800 dark:text-gray-200" />
              </button>
            )}

            {/* Media Section - Video, Image or Initials */}
            <div className="w-full p-[15px] aspect-video overflow-hidden">
              {hasVideo ? (
                // YouTube Video
                <iframe
                  width="100%"
                  height="100%"
                  className="rounded-[12px]"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=0&controls=1&rel=0`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : product.arrays?.arrayOne?.[0] ? (
                // Product Image
                <div className="w-full h-full rounded-[12px] overflow-hidden">
                  <img
                    src={`${IMAGE_BASE_URL}${product.arrays.arrayOne[0]}`}
                    alt={product.title || "Food item"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                // Fallback to Initials
                <div className="w-full h-full rounded-[12px] bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-4xl font-semibold text-orange-800 dark:text-orange-300">
                  {getInitials(product.title)}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-4">
              <div className="flex items-start mb-2">
                <div className="flex items-center space-x-2">
                  {/* Veg/Non-veg/Egg Indicator - Make fully dynamic */}
                  {product.foodType === "Veg-Only" ? (
                    <div className="w-5 h-5 border border-green-600 dark:border-green-500 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-full"></div>
                    </div>
                  ) : product.foodType && product.foodType.includes("Egg") ? (
                    <div className="w-5 h-5 border border-amber-500 dark:border-amber-400 flex items-center justify-center">
                      <div className="w-3 h-3 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border border-red-600 dark:border-red-500 flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-600 dark:bg-red-500 rounded-full"></div>
                    </div>
                  )}

                  {/* Badge - Only shown if product has a badge */}
                  {product.badge && (
                    <div
                      className="text-white text-xs font-bold py-0.5 px-1.5 rounded-[4px] shadow-sm"
                      style={{ backgroundColor: product.badgeColor || getBadgeColor(product.badge) }}
                    >
                      {getBadgeText(product.badge)}
                    </div>
                  )}
                </div>

                <div className="flex items-center ml-auto">
                  <Star size={16} className="text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">3.9 (75)</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {product.title?.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase()) || "Untitled"}
              </h2>

              <div className="text-lg font-bold text-orange-600 dark:text-orange-500 mb-3">
                ₹{product.numbers?.numberOne}
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                {product.description?.replace(/<\/?(p|span)[^>]*>/g, "") || ""}
              </p>

              {/* Bottom Close Button - Only for mobile */}
              {isMobile && (
                <div className="pt-8 pb-8">
                  <button
                    onClick={onClose}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
