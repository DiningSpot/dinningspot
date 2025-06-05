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
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
    const fetchOutletIcon = async () => {
      setLoadingState('loading')
      
      try {
        const pathParts = pathname.split('/').filter(Boolean)
        const outletId = pathParts[pathParts.length - 1]
        
        if (!outletId) throw new Error('No outlet ID found in URL')

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
    }, 2000)

    return () => clearTimeout(timer)
  }, [onSubmit])

  const imageUrl = outletIcon 
    ? `https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/foodmenu-websitebuilder-s3-bucket/${outletIcon}`
    : null

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 bg-white backdrop-blur-[8px] flex items-center justify-center z-[1002] h-screen w-screen">
      <motion.div
        className="w-full h-full max-w-none max-h-none relative flex items-center justify-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ 
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1] // More refined easing curve
        }}
      >
        <div className="text-center h-full mb-6">
          {imageUrl && (
            <div className="flex h-[80vh] justify-center items-center md:-mb-16">
              <div className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] relative">
                <Image
                  src={imageUrl}
                  alt="Outlet Icon"
                  fill
                  className="object-contain md:pt-16"
                  unoptimized
                  priority
                />
                {loadingState === 'loading' && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end">
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
              className="text-xl md:text-5xl mr-2 md:mr-4"
            >
              👋
            </motion.div>
            <div>
              <h2 className="text-[20px] md:text-4xl flex items-center font-bold text-black">
                Hi, {name}!
              </h2>
            </div>
          </div>
          <p className="text-black/70 mt-2 md:mt-4 text-md md:text-xl">
            Welcome back! Good to see you.
          </p>
        </div>
      </motion.div>
    </div>
  )
}