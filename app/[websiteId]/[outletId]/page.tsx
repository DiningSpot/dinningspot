"use client"

import { useEffect, useState } from "react"
import MenuCard from "@/app/menu-card"
import { useParams } from "next/navigation"
import Image from "next/image"
import { getProjectId } from "@/constants/index"
export default function MenuCardPage() {
  const params = useParams()
  const websiteId = params?.websiteId as string
  const outletId = params?.outletId as string
  const [error, setError] = useState<string | null>(null)
  const [outletIcon, setOutletIcon] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreloader, setShowPreloader] = useState(true)
console.log(getProjectId());
  // Validate params and fetch outlet icon
  useEffect(() => {
    if (!websiteId || !outletId) {
      setError("Invalid website or outlet ID")
      setIsLoading(false)
      setShowPreloader(false)
      return
    }

    const fetchOutletIcon = async () => {
      try {
        const response = await fetch(
          `https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder/website/outlet-management/get-outlet-by-id/${outletId}`
        )
        const data = await response.json()
        if (data.data?.icon) {
          setOutletIcon(data.data.icon)
        }
      } catch (error) {
        console.error("Failed to fetch outlet icon:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOutletIcon()
  }, [websiteId, outletId])

  // Hide preloader after 1.5 seconds if icon is available
  useEffect(() => {
    if (!isLoading && outletIcon) {
      const timer = setTimeout(() => {
        setShowPreloader(false)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setShowPreloader(false)
    }
  }, [isLoading, outletIcon])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {showPreloader && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          {outletIcon && (
            <div className="w-32 h-32 relative">
              <Image
                src={`https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/foodmenu-websitebuilder-s3-bucket/${outletIcon}`}
                alt="Outlet Icon"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>
      )}
      <MenuCard websiteId={websiteId} outletId={outletId} />
    </>
  )
}