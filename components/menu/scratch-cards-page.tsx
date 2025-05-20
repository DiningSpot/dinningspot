"use client"
import { useState, useEffect, useRef } from "react"
import { X, Gift, Share2 } from "lucide-react"
import ScratchCardItem from "./scratch-card-item"
import OfferDetail from "./offer-detail"
import type { ScratchCardItem as ScratchCardItemType } from "@/types/menu"

interface ScratchCardsPageProps {
  scratchCards: ScratchCardItemType[]
  onClose: () => void
  onScratchComplete: (cardId: number) => void
  isMobile: boolean
}

export default function ScratchCardsPage({
  scratchCards,
  onClose,
  onScratchComplete,
  isMobile,
}: ScratchCardsPageProps) {
  const [showWinScreen, setShowWinScreen] = useState(false)
  const [currentWin, setCurrentWin] = useState<ScratchCardItemType | null>(null)
  const [showOfferDetail, setShowOfferDetail] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<ScratchCardItemType | null>(null)
  const [showScratchModal, setShowScratchModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ScratchCardItemType | null>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showScratchModal || showWinScreen || showOfferDetail) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showScratchModal, showWinScreen, showOfferDetail])

  // Load and trigger confetti when win screen shows
  useEffect(() => {
    if (showWinScreen && currentWin) {
      // Dynamically import the confetti library
      import("canvas-confetti")
        .then((confettiModule) => {
          const confetti = confettiModule.default

          // Fire the confetti from the center
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })

          // Fire another burst after a short delay from the left
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
            })
          }, 250)

          // And another from the right side
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
            })
          }, 400)
        })
        .catch((err) => console.error("Failed to load confetti:", err))
    }
  }, [showWinScreen, currentWin])

  const handleScratchComplete = (cardId: number) => {
    const card = scratchCards.find((card) => card.id === cardId)
    if (card) {
      // Update the card as scratched
      card.isScratched = true
      card.lastScratchedTime = Date.now()

      // Close scratch modal and show win screen
      setShowScratchModal(false)
      setCurrentWin(card)
      setShowWinScreen(true)

      // Call parent handler
      onScratchComplete(cardId)
    }
  }

  const handleCardClick = (card: ScratchCardItemType) => {
    if (card.isScratched) {
      // If already scratched, show offer details
      setSelectedOffer(card)
      setShowOfferDetail(true)
    } else {
      // If not scratched, show scratch modal
      setSelectedCard(card)
      setShowScratchModal(true)
    }
  }

  const handleViewOfferDetails = (offer: ScratchCardItemType) => {
    setSelectedOffer(offer)
    setShowOfferDetail(true)
    setShowWinScreen(false)
  }

  const handleShare = () => {
    if (!currentWin) return

    if (navigator.share) {
      navigator
        .share({
          title: `I won ${currentWin.value}!`,
          text: `I just won ${currentWin.value} ${currentWin.title} from ${currentWin.brand || "the scratch card"}!`,
          url: window.location.href,
        })
        .catch((err) => console.log("Error sharing:", err))
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareText = `I just won ${currentWin.value} ${currentWin.title} from ${currentWin.brand || "the scratch card"}!`
      const shareUrl = window.location.href

      // Copy to clipboard
      navigator.clipboard
        .writeText(`${shareText} ${shareUrl}`)
        .then(() => alert("Copied to clipboard!"))
        .catch(() => alert("Failed to copy. Please share manually."))
    }
  }

  if (showOfferDetail && selectedOffer) {
    return <OfferDetail offer={selectedOffer} onBack={() => setShowOfferDetail(false)} />
  }

  if (showWinScreen && currentWin) {
    return (
      <div className="fixed inset-0 bg-blue-600 dark:bg-[#090e17] z-50 flex flex-col items-center justify-center p-6">
        {/* Header with buttons - moved to top of screen */}
        <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-20">
          <div></div> {/* Empty div for spacing */}
          <div className="flex space-x-4">
            <button onClick={handleShare} className="text-white p-2">
              <Share2 size={24} />
            </button>
            <button onClick={() => setShowWinScreen(false)} className="text-white p-2">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="text-center z-20 mt-12">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-blue-500 dark:bg-blue-700 rounded-full flex items-center justify-center">
              <Gift className="text-white w-12 h-12" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">You've won</h2>
          <div className="text-4xl font-bold text-white mb-6">{currentWin.value}</div>

          <p className="text-white mb-8">{currentWin.title}</p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleViewOfferDetails(currentWin)}
              className="bg-white text-blue-600 dark:text-blue-700 px-6 py-2 rounded-full font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Scratch Card Modal - Removed background color
  if (showScratchModal && selectedCard) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="relative rounded-xl max-w-sm w-full overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => setShowScratchModal(false)}
              className="bg-white dark:bg-gray-800 rounded-full p-1 text-gray-600 dark:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-bold text-center mb-4 text-gray-800 dark:text-white">Scratch to Reveal</h3>

            <div className="max-w-[250px] mx-auto">
              <ScratchCardItem
                card={selectedCard}
                onScratchComplete={() => handleScratchComplete(selectedCard.id)}
                onCardClick={() => {}}
                isMobile={isMobile}
                inModal={true}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-yellow-50 dark:bg-[#090e17] z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-orange-600 dark:text-orange-500">Scratch Cards</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
        {/* Scratch Cards - Reduced text size for mobile */}
        <div className="grid grid-cols-2 gap-4 px-0">
          {scratchCards.map((card) => (
            <ScratchCardItem
              key={card.id}
              card={card}
              onScratchComplete={() => {}}
              onCardClick={() => handleCardClick(card)}
              isMobile={isMobile}
              inModal={false}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Click on a card to scratch and reveal your reward!
        </p>
      </div>
    </div>
  )
}
