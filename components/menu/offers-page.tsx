"use client"
import { X } from "lucide-react"
import OfferCard from "./offer-card"
import OfferDetail from "./offer-detail"
import { useState, useEffect } from "react"
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

interface OffersPageProps {
  onClose: () => void
  getIconComponent: (iconName: string, size?: number) => JSX.Element
  isMobile: boolean
  websiteId: string
}

export default function OffersPage({ onClose, getIconComponent, isMobile, websiteId }: OffersPageProps) {
  const [showOfferDetail, setShowOfferDetail] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/website/offers/get-all-offers/${websiteId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch offers: ${response.status}`)
        }

        const data = await response.json()

        if (data.data && Array.isArray(data.data)) {
          setOffers(data.data)
        } else {
          setOffers([])
        }
      } catch (err) {
        console.error("Error fetching offers:", err)
        setError(err instanceof Error ? err.message : "Failed to load offers")
        setOffers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffers()
  }, [websiteId])

  const handleViewOfferDetails = (offer: Offer) => {
    // Check if offer is expired
    const isExpired = new Date(offer.validity.end) < new Date()
    if (isExpired) {
      return // Don't open detail view for expired offers
    }

    setSelectedOffer(offer)
    setShowOfferDetail(true)
  }

  if (showOfferDetail && selectedOffer) {
    return <OfferDetail offer={selectedOffer} onBack={() => setShowOfferDetail(false)} />
  }

  // Format the validity date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 bg-[#f3f4f6] dark:bg-[#090e17] z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button onClick={onClose} className="mr-4 text-gray-700 dark:text-gray-300">
              <X />
            </button>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Redeem your coupons</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">No offers available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {offers.map((offer, index) => (
              <OfferCard
                key={offer._id}
                offer={{
                  ...offer,
                  imageUrl: offer.offerImage ? `${IMAGE_BASE_URL}${offer.offerImage}` : null,
                  minOrder: offer.minOrderValue,
                  expiryDate: formatDate(offer.validity.end),
                }}
                onClick={() => handleViewOfferDetails(offer)}
                isMobile={isMobile}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
