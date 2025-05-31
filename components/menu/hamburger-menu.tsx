"use client"
import { X, MessageSquare } from "lucide-react"

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
  onSectionSelect: (section: string) => void
}

export default function HamburgerMenu({ isOpen, onClose, onSectionSelect }: HamburgerMenuProps) {
  if (!isOpen) return null

  // Custom SealPercent icon (similar to Phosphor's SealPercent)
  const SealPercent = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
      <path d="M8 8L16 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.5" fill="white" />
      <circle cx="15" cy="15" r="1.5" fill="white" />
    </svg>
  )

  return (
    <div className="fixed left-0 top-0 h-full w-full md:w-96 bg-white dark:bg-[#090e17] shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-orange-600 dark:text-orange-500">Menu</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
<div className="flex flex-col min-h-[90vh] justify-between">
        {/* Menu Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Offers Card */}
          <div
            className="bg-[#FF5722] dark:bg-[#FF5722] text-white rounded-xl p-6 cursor-pointer"
            onClick={() => {
              onSectionSelect("offers")
              onClose()
            }}
          >
            <div className="flex flex-col">
              <div>
                <h3 className="text-xl font-bold italic mb-1">OFFER</h3>
                <p className="text-sm text-white/80 mb-2">EAT OUT & SAVE MORE</p>
                <p className="text-base font-bold text-white/90">UP TO 50% OFF</p>
              </div>
              <div className="self-end mt-4">
                <SealPercent />
              </div>
            </div>
          </div>

          {/* Scratch Cards - Commented out */}
          {/* <div
            className="bg-[#FFC107] dark:bg-[#FFC107] text-white rounded-xl p-6 cursor-pointer"
            onClick={() => {
              onSectionSelect("scratchcards")
              onClose()
            }}
          >
            <div className="flex flex-col">
              <div>
                <h3 className="text-xl font-bold italic mb-1">SCRATCH & WIN</h3>
                <p className="text-sm text-white/80 mb-2">TRY YOUR LUCK TODAY</p>
                <p className="text-base font-bold text-white/90">WIN EXCITING REWARDS</p>
              </div>
              <div className="self-end mt-4">
                <Gift size={32} className="text-white" />
              </div>
            </div>
          </div> */}

          {/* Feedback */}
          <div
            className="bg-[#9C27B0] dark:bg-[#9C27B0] text-white rounded-xl p-6 cursor-pointer"
            onClick={() => {
              onSectionSelect("feedback")
              onClose()
            }}
          >
            <div className="flex flex-col">
              <div>
                <h3 className="text-xl font-bold italic mb-1">FEEDBACK</h3>
                <p className="text-sm text-white/80 mb-2">SHARE YOUR EXPERIENCE</p>
                <p className="text-base font-bold text-white/90">HELP US IMPROVE</p>
              </div>
              <div className="self-end mt-4">
                <MessageSquare size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>
         <div className="py-6 text-center border-t border-gray-200 dark:border-gray-800 mt-10">
              <a
                href="https://www.dinningspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <span className="font-normal">Powered by </span>
                <span className="font-semibold">Dinning Spot</span>
              </a>
            </div>
      </div>
      </div>
    </div>
  )
}
