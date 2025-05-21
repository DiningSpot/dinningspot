
"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { usePathname } from "next/navigation"

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
  const [outletIcon, setOutletIcon] = useState<string | null>(null)
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const pathname = usePathname()

  useEffect(() => {
    const fetchOutletIcon = async () => {
      setLoadingState('loading')
      
      try {
        // Extract outlet ID from URL
        const pathParts = pathname.split('/').filter(Boolean)
        const outletId = pathParts[pathParts.length - 1]
        
        if (!outletId) {
          throw new Error('No outlet ID found in URL')
        }

        const API_ENDPOINT = `https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder/website/outlet-management/get-outlet-by-id/${outletId}`
        
        const response = await fetch(API_ENDPOINT)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        const icon = data.data?.icon

        if (!icon) throw new Error('No icon found in response')

        setOutletIcon(icon)
        setLoadingState('success')
      } catch (error) {
        console.error('Fetch error:', error)
        setLoadingState('error')
        setOutletIcon("1747734790831_html-5.png")
      }
    }

    fetchOutletIcon()
  }, [pathname])

  useEffect(() => {
    const timer = setTimeout(() => {
      onSubmit()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onSubmit])

  const imageUrl = outletIcon 
    ? `https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/foodmenu-websitebuilder-s3-bucket/${outletIcon}`
    : null

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-[8px] flex items-center justify-center z-[1002] h-screen w-screen">
      <motion.div
        className="w-full h-full max-w-none max-h-none relative flex items-center justify-center"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center mb-6">
          {/* Outlet Icon - No animation */}
          {imageUrl && (
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 relative">
                <Image
                  src={imageUrl}
                  alt="Outlet Icon"
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                  onError={() => setOutletIcon("1747734790831_html-5.png")}
                />
                {loadingState === 'loading' && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {loadingState === 'error' && (
            <p className="text-red-500 mb-4">Using fallback icon</p>
          )}

          {/* Greeting - Only hand emoji has animation */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ rotate: -20 }}
              animate={{ rotate: [0, 15, 0, 15, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "bottom center" }}
              className="text-5xl mr-4"
            >
              👋
            </motion.div>
            <h2 className="text-4xl font-bold text-black">
              Hi, {name}!
            </h2>
          </div>

          <p className="text-black/70 mt-4 text-xl">
            Welcome back! Good to see you.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
