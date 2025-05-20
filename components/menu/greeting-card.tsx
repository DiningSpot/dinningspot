"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface GreetingCardProps {
  name: string
  onClose: () => void
  onSubmit: () => void
}

export default function GreetingCard({ 
  name, 
  onClose, 
  onSubmit
}: GreetingCardProps) {
  const [isVisible] = useState(true)
  const [outletIcon, setOutletIcon] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Static API endpoint
  const API_ENDPOINT = "https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder/website/outlet-management/get-outlet-by-id/682c642284d8ab75f25dc9f7"

  useEffect(() => {
    const fetchOutletIcon = async () => {
      setLoadingState('loading')
      console.log('[1] Starting fetch from:', API_ENDPOINT)
      
      try {
        const response = await fetch(API_ENDPOINT)
        console.log('[2] Response status:', response.status)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('[3] API Response:', data)

        const icon = data.data?.icon
        console.log('[4] Extracted icon:', icon)

        if (!icon) {
          throw new Error('No icon found in response')
        }

        setOutletIcon(icon)
        setLoadingState('success')
      } catch (error) {
        console.error('[5] Fetch error:', error)
        setLoadingState('error')
        // Fallback to static icon if fetch fails
        setOutletIcon("1747734790831_html-5.png")
      }
    }

    fetchOutletIcon()
  }, [])

  // Auto-submit after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onSubmit()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onSubmit])

  const imageUrl = outletIcon 
    ? `https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/foodmenu-websitebuilder-s3-bucket/${outletIcon}`
    : null

  console.log('[6] Current state:', {
    loadingState,
    outletIcon,
    imageUrl
  })

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-[8px] flex items-center justify-center z-50 h-screen w-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full max-w-none max-h-none relative flex items-center justify-center"
      >
        <div className="text-center mb-6">
          {/* Outlet Icon */}
          {imageUrl && (
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-32 h-32 relative">
                <Image
                  src={imageUrl}
                  alt="Outlet Icon"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                  onError={(e) => {
                    console.error('[7] Image load error:', e)
                    // Fallback to static icon if dynamic fails
                    setOutletIcon("1747734790831_html-5.png")
                  }}
                  onLoad={() => console.log('[8] Image loaded successfully')}
                />
                {loadingState === 'loading' && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Loading states */}
          {loadingState === 'error' && (
            <p className="text-red-500 mb-4">Using fallback icon</p>
          )}

          {/* Greeting */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: [0, 15, 0, 15, 0], opacity: 1 }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 1,
                ease: "easeInOut",
                opacity: { duration: 0.3 }
              }}
              className="text-5xl mr-4"
              style={{ transformOrigin: "bottom center" }}
            >
              👋
            </motion.div>
            <motion.h2 
              className="text-4xl font-bold text-black"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Hi, {name}!
            </motion.h2>
          </div>

          <motion.p 
            className="text-black/70 mt-4 text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Welcome back! Good to see you.
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}   