"use client"
import { ArrowLeft } from "lucide-react"
import ShareButton from "./share-button"

interface OfferDetailProps {
  offer: {
    _id: string
    title: string
    subTitle: string
    description: string
    offerImage?: string
    minOrderValue: number
    validity: {
      start: string
      end: string
    }
  }
  onBack: () => void
}

// Base URL for images
const IMAGE_BASE_URL = "https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/foodmenu-websitebuilder-s3-bucket/"

export default function OfferDetail({ offer, onBack }: OfferDetailProps) {
  // Define gradient colors for text
  const gradientStyles = [
    {
      textGradient: "linear-gradient(to right, rgb(150 80 214), rgb(179 139 202))", // Purple gradient
      accentColor: "#9d5ec7", // Accent color for button
    },
    {
      textGradient: "linear-gradient(to right, rgb(255 142 26), rgb(237 187 123))", // Orange gradient
      accentColor: "#e89d5e", // Accent color for button
    },
    {
      textGradient: "linear-gradient(to right, rgb(41 219 160), rgb(116 232 197))", // Teal gradient
      accentColor: "#5eb8c7", // Accent color for button
    },
    {
      textGradient: "linear-gradient(to right, rgb(255 40 69), rgb(222 128 142))", // Red gradient
      accentColor: "#e86e6e", // Accent color for button
    },
  ]

  // Use a consistent style based on offer ID
  const styleIndex = Number.parseInt(offer._id.substring(offer._id.length - 2), 16) % gradientStyles.length
  const style = gradientStyles[styleIndex]

  // Format the validity dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Default images if no offer image is available
  const defaultImages = [
    "/gourmet-pasta-dish.png",
    "/italian-feast.png",
    "/delightful-dessert-assortment.png",
    "/diverse-food-delivery.png",
  ]

  // Get image URL
  const imageUrl = offer.offerImage ? `${IMAGE_BASE_URL}${offer.offerImage}` : defaultImages[styleIndex]

  // Title style with gradient text
  const titleStyle = {
    background: style.textGradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
  }

  // Parse description to create bullet points for T&C
  const getTermsAndConditions = () => {
    if (!offer.description) return []

    // Split by newlines and filter out empty lines
    return offer.description
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }

  const termsAndConditions = getTermsAndConditions()

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#090e17] z-50 overflow-y-auto">
      <div className="p-2.5">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="flex items-center text-gray-600 dark:text-gray-300">
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>

          <div className="flex space-x-3">
            <ShareButton
              title={`${offer.title} - ${offer.subTitle}`}
              text={`Check out this offer: ${offer.title} - ${offer.subTitle}`}
            />
          </div>
        </div>

        {/* Offer Card with matching style */}
        <div className="mb-4 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          {/* Top image - using the same image as the card */}
          <div className="w-full md:aspect-auto aspect-square overflow-hidden">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={offer.title}
              className="w-full md:h-[350px] h-full p-[13px] rounded-[21px] object-cover"
            />
          </div>

          {/* Content below image */}
          <div className="p-4 rounded-b-lg">
            {/* Title and subtitle */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1" style={titleStyle}>
                {offer.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{offer.subTitle}</p>
            </div>

            {/* Valid till and min purchase - left aligned */}
            <div className="flex flex-col space-y-2 mb-4 border-t border-b border-gray-200 dark:border-gray-700 py-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-28">Valid till:</span>
                <span className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(offer.validity.end)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-28">Min purchase:</span>
                <span className="text-base font-medium text-gray-800 dark:text-gray-200">₹{offer.minOrderValue}</span>
              </div>
            </div>

            {/* T & C from description */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2 dark:text-white">T & C</h3>
              <ul className="space-y-2">
                {termsAndConditions.length > 0 ? (
                  termsAndConditions.map((term, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 mr-2"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{term}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-600 dark:text-gray-300">Terms and conditions apply.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <button
            onClick={onBack}
            className="w-full py-3 rounded-lg font-medium text-white"
            style={{ backgroundColor: style.accentColor }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
