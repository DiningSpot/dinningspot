"use client"

interface OfferCardProps {
  offer: {
    _id: string
    title: string
    subTitle: string
    imageUrl: string | null
    minOrder: number
    expiryDate: string
    validity: {
      start: string
      end: string
    }
  }
  onClick: () => void
  isMobile: boolean
  index: number
}

export default function OfferCard({ offer, onClick, isMobile, index }: OfferCardProps) {
  // Define gradient colors for text
  const gradientStyles = [
    {
      textGradient: "linear-gradient(to right, rgb(150 80 214), rgb(179 139 202))", // Purple gradient
    },
    {
      textGradient: "linear-gradient(to right, rgb(255 142 26), rgb(237 187 123))", // Orange gradient
    },
    {
      textGradient: "linear-gradient(to right, rgb(41 219 160), rgb(116 232 197))", // Teal gradient
    },
    {
      textGradient: "linear-gradient(to right, rgb(255 40 69), rgb(222 128 142))", // Red gradient
    },
  ]

  // Get style based on index (cycle through the styles)
  const style = gradientStyles[index % gradientStyles.length]

  // Default images if no offer image is available
  const defaultImages = [
    "/gourmet-pasta-dish.png",
    "/italian-feast.png",
    "/delightful-dessert-assortment.png",
    "/diverse-food-delivery.png",
  ]

  // Check if offer is expired
  const isExpired = new Date(offer.validity.end) < new Date()

  // Title style with gradient text
  const titleStyle = {
    background: isExpired ? "gray" : style.textGradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all flex flex-col bg-white dark:bg-white/95 ${
        isExpired ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"
      }`}
      onClick={isExpired ? undefined : onClick}
    >
      {/* Left side notch */}
      <div className="absolute left-0 bottom-[55px] -translate-y-1/2 w-2 h-4 bg-[#f3f4f6] dark:bg-[#090e17] rounded-r-full" />

      {/* Right side notch */}
      <div className="absolute right-0 bottom-[55px] -translate-y-1/2 w-2 h-4 bg-[#f3f4f6] dark:bg-[#090e17] rounded-l-full" />

      {/* Dashed line connecting the notches */}
      <div className="absolute left-4 right-4 bottom-[55px] mb-[14px] -translate-y-1/2 border-t-2 border-dashed dark:border-[#f5f5f5]/10 border-[#090e17]/10 z-10" />

      {/* Expired overlay */}
      {isExpired && (
        <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 flex items-center justify-center z-20">
          <div className="bg-gray-800/80 text-white px-3 py-1 rounded-full transform -rotate-12 text-sm font-bold">
            EXPIRED
          </div>
        </div>
      )}

      {/* Top image - made square */}
      <div className="w-full aspect-square overflow-hidden">
        <img
          src={offer.imageUrl || defaultImages[index % defaultImages.length]}
          alt={offer.title}
          className="w-full h-full p-[13px] rounded-[21px] object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <div className="text-2xl font-bold mb-1" style={titleStyle}>
          {offer.title}
        </div>

        {/* Description */}
        <div className="text-black dark:text-black text-sm mb-4">
          <p className="line-clamp-2">{offer.subTitle}</p>
        </div>

        {/* Bottom info */}
        <div className="mt-[20px] flex justify-between items-end">
          {/* Min Purchase */}
          <div className="flex flex-col">
            <span className="text-black/70 dark:text-black/70 text-xs">Min purchase</span>
            <span className="text-black dark:text-black font-bold text-sm">₹{offer.minOrder}</span>
          </div>

          {/* Valid till date */}
          <div className="flex flex-col items-end">
            <span className="text-black/70 dark:text-black/70 text-xs">Valid till</span>
            <span className="text-black dark:text-black text-sm">{offer.expiryDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
