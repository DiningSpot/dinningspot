"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import { API_BASE_URL, IMAGE_BASE_URL } from "@/constants"

interface OfferValidity {
  start: string
  end: string
}

interface Offer {
  _id: string
  offerImage?: string
  title: string
  subTitle: string
  description: string
  minOrderValue: number
  validity: OfferValidity
  status: string
}

interface OfferPopupProps {
  websiteId: string
  onClose: () => void
}

export default function OfferPopup({ websiteId, onClose }: OfferPopupProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log("[OfferPopup] Fetching offers from:", `${API_BASE_URL}/website/offers/get-all-offers/${websiteId}`)
        const response = await fetch(`${API_BASE_URL}/website/offers/get-all-offers/${websiteId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch offers: ${response.status}`)
        }
        const data = await response.json()
        console.log("[OfferPopup] API response data:", data)
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Filter out expired offers
          const validOffers = data.data.filter((offer: Offer) => new Date(offer.validity.end) >= new Date())
          if (validOffers.length === 0) {
            console.log("[OfferPopup] No valid offers found, closing")
            onClose()
          }
          setOffers(validOffers)
        } else {
          console.log("[OfferPopup] No offers found, closing")
          onClose()
        }
      } catch (err) {
        console.error("[OfferPopup] Error fetching offers:", err)
        setError(err instanceof Error ? err.message : "Failed to load offers")
        onClose()
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffers()
  }, [websiteId, onClose])

  // Preload images to improve carousel performance
  useEffect(() => {
    offers.forEach((offer) => {
      if (offer.offerImage) {
        const img = new Image()
        img.src = `${IMAGE_BASE_URL}${offer.offerImage}`
        img.onload = () => console.log("[OfferPopup] Image preloaded successfully:", img.src)
        img.onerror = () => console.error("[OfferPopup] Failed to preload image:", img.src)
      }
    })
  }, [offers])

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 z-[1003] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </motion.div>
    )
  }

  if (!offers.length || error) {
    return null // Silently close without rendering
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-[1003] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="rounded-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 text-gray-100 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500"
          aria-label="Close offer popup"
        >
          <X size={24} />
        </button>
        <div className="p-6 h-full w-full flex items-center justify-center">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full"
          >
            {offers.map((offer) => (
              <SwiperSlide key={offer._id}>
                <div className="flex flex-col items-center">
                  {offer.offerImage ? (
                    <img
                      src={`${IMAGE_BASE_URL}${offer.offerImage}`}
                      alt={offer.title}
                      className="w-full h-[100%] object-cover rounded-lg mb-4"
                      onError={(e) => {
                        console.error("[OfferPopup] Image failed to load:", `${IMAGE_BASE_URL}${offer.offerImage}`)
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-gray-500 dark:text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </motion.div>
  )
}
