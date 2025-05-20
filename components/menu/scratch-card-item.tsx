"use client"
import ScratchCard from "react-scratchcard-v2"
import type { ScratchCardItem as ScratchCardItemType } from "@/types/menu"
import { useEffect, useRef, useState } from "react"

interface ScratchCardItemProps {
  card: ScratchCardItemType
  onScratchComplete: () => void
  onCardClick: () => void
  isMobile: boolean
  inModal?: boolean
}

export default function ScratchCardItem({
  card,
  onScratchComplete,
  onCardClick,
  isMobile,
  inModal = false,
}: ScratchCardItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [isSafari, setIsSafari] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [scratchPercentage, setScratchPercentage] = useState(0)

  // Check if browser is Safari
  useEffect(() => {
    const isSafariBrowser =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("AppleWebKit") && !navigator.userAgent.includes("Chrome"))

    setIsSafari(isSafariBrowser)
  }, [])

  // Measure container size
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
          setContainerHeight(entry.contentRect.width) // Keep aspect ratio square
        }
      })

      resizeObserver.observe(containerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  // Safari scratch implementation
  useEffect(() => {
    if (!isSafari || !inModal || card.isScratched || !canvasRef.current || !containerWidth) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = containerWidth
    canvas.height = containerHeight

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, containerWidth, containerHeight)
    gradient.addColorStop(0, "#FFD700")
    gradient.addColorStop(1, "#FFA500")

    // Fill canvas with gradient
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, containerWidth, containerHeight)

    // Add pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
    ctx.lineWidth = 2

    // Draw diagonal lines
    for (let i = 0; i < containerWidth * 2; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i - containerHeight, containerHeight)
      ctx.stroke()
    }

    // Draw gift icon
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    const iconSize = 64

    // Circle
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, iconSize / 2 - 2, 0, Math.PI * 2)
    ctx.stroke()

    // Gift box
    ctx.beginPath()
    ctx.rect(centerX - 12, centerY - 4, 24, 18)
    ctx.stroke()

    // Lid
    ctx.beginPath()
    ctx.rect(centerX - 14, centerY - 8, 28, 6)
    ctx.stroke()

    // Ribbon
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - 8)
    ctx.lineTo(centerX, centerY + 14)
    ctx.stroke()

    // Bows
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - 8)
    ctx.bezierCurveTo(centerX - 4, centerY - 14, centerX - 8, centerY - 14, centerX - 8, centerY - 10)
    ctx.bezierCurveTo(centerX - 8, centerY - 7, centerX - 4, centerY - 6, centerX, centerY - 8)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(centerX, centerY - 8)
    ctx.bezierCurveTo(centerX + 4, centerY - 14, centerX + 8, centerY - 14, centerX + 8, centerY - 10)
    ctx.bezierCurveTo(centerX + 8, centerY - 7, centerX + 4, centerY - 6, centerX, centerY - 8)
    ctx.stroke()

    // Variables for scratch tracking
    let isDrawing = false
    let lastX = 0
    let lastY = 0
    let scratchedPixels = 0
    const totalPixels = containerWidth * containerHeight

    // Function to calculate scratched percentage
    const calculateScratchPercentage = () => {
      const imageData = ctx.getImageData(0, 0, containerWidth, containerHeight)
      let transparentPixels = 0

      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 50) {
          // If alpha is less than 50, consider it scratched
          transparentPixels++
        }
      }

      const percentage = (transparentPixels / (imageData.data.length / 4)) * 100
      setScratchPercentage(percentage)

      // Increased threshold from 50% to 80% - requires more scratching
      if (percentage > 80 && !isRevealed) {
        setIsRevealed(true)
        onScratchComplete()
      }
    }

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      isDrawing = true
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      lastX = touch.clientX - rect.left
      lastY = touch.clientY - rect.top
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!isDrawing) return

      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const currentX = touch.clientX - rect.left
      const currentY = touch.clientY - rect.top

      // Draw scratch effect
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(currentX, currentY, 20, 0, Math.PI * 2)
      ctx.fill()

      // Connect previous point to current with a line
      ctx.lineWidth = 40
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()

      lastX = currentX
      lastY = currentY

      // Calculate scratch percentage
      scratchedPixels += Math.PI * 20 * 20
      // Increased threshold from 50% to 80% - requires more scratching
      if (scratchedPixels > totalPixels * 0.8 && !isRevealed) {
        setIsRevealed(true)
        onScratchComplete()
      }

      // Periodically calculate actual scratch percentage (less frequently for performance)
      if (Math.random() < 0.1) {
        calculateScratchPercentage()
      }
    }

    const handleTouchEnd = () => {
      isDrawing = false
      calculateScratchPercentage() // Final calculation
    }

    // Add event listeners
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    // Mouse event handlers for testing on desktop Safari
    const handleMouseDown = (e: MouseEvent) => {
      isDrawing = true
      const rect = canvas.getBoundingClientRect()
      lastX = e.clientX - rect.left
      lastY = e.clientY - rect.top
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return

      const rect = canvas.getBoundingClientRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top

      // Draw scratch effect
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(currentX, currentY, 20, 0, Math.PI * 2)
      ctx.fill()

      // Connect previous point to current with a line
      ctx.lineWidth = 40
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()

      lastX = currentX
      lastY = currentY

      // Calculate scratch percentage
      scratchedPixels += Math.PI * 20 * 20
      // Increased threshold from 50% to 80% - requires more scratching
      if (scratchedPixels > totalPixels * 0.8 && !isRevealed) {
        setIsRevealed(true)
        onScratchComplete()
      }

      // Periodically calculate actual scratch percentage
      if (Math.random() < 0.1) {
        calculateScratchPercentage()
      }
    }

    const handleMouseUp = () => {
      isDrawing = false
      calculateScratchPercentage() // Final calculation
    }

    // Add mouse event listeners for desktop Safari
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseUp)

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseUp)
    }
  }, [isSafari, inModal, card.isScratched, containerWidth, containerHeight, onScratchComplete])

  // Get the theme mode for SVG background
  const isDarkMode = document.documentElement.classList.contains("dark")
  const bgColor = isDarkMode ? "%23090e17" : "%23FFFFFF"
  const bgOpacity = isDarkMode ? "0.5" : "0"

  // Safari compatibility - show custom canvas for Safari
  if (isSafari && inModal && !card.isScratched) {
    return (
      <div className="bg-white dark:bg-[#090e17] rounded-lg overflow-hidden shadow-md" ref={containerRef}>
        <div className="relative aspect-square w-full">
          {/* Background card that will be revealed */}
          <div
            className="absolute inset-0 flex items-center justify-center p-2"
            style={{ backgroundColor: card.color }}
          >
            <div className="text-center">
              <div className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-white`}>{card.value}</div>
              <div className={`${isMobile ? "text-xs" : "text-sm"} mt-1 text-white`}>{card.title}</div>
              {card.code && (
                <div className={`${isMobile ? "text-[10px]" : "text-xs"} mt-1 text-white`}>Code: {card.code}</div>
              )}
            </div>
          </div>

          {/* Canvas overlay for scratching */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            style={{
              opacity: isRevealed ? 0 : 1,
              transition: "opacity 0.3s ease-out",
            }}
          />
        </div>
        <div className="p-3 bg-white dark:bg-[#090e17]">
          <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-center text-gray-700 dark:text-gray-300`}>
            {isRevealed ? "Scratched!" : "Scratch to reveal your reward!"}
          </p>
          {!isRevealed && scratchPercentage > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-green-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(scratchPercentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-[#090e17] rounded-lg overflow-hidden shadow-md"
      ref={containerRef}
      onClick={() => !inModal && !card.isScratched && onCardClick()}
    >
      <div className="relative aspect-square w-full">
        {card.isScratched ? (
          // Scratched card view
          <div
            className="h-full w-full flex items-center justify-center p-2 cursor-pointer"
            style={{ backgroundColor: card.color }}
            onClick={() => !inModal && onCardClick()}
          >
            <div className="text-center">
              <div className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-white`}>{card.value}</div>
              <div className={`${isMobile ? "text-xs" : "text-sm"} mt-1 text-white`}>{card.title}</div>
              {card.code && (
                <div className={`${isMobile ? "text-[10px]" : "text-xs"} mt-1 text-white`}>Code: {card.code}</div>
              )}
            </div>
          </div>
        ) : inModal ? (
          // Unscratched card with scratch functionality (in modal)
          <div className="h-full w-full flex items-center justify-center">
            {containerWidth > 0 && (
              <ScratchCard
                width={containerWidth}
                height={containerHeight}
                image={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${containerWidth}" height="${containerHeight}" viewBox="0 0 ${containerWidth} ${containerHeight}">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:%23FFD700;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:%23FFA500;stop-opacity:1" />
                    </linearGradient>
                    <pattern id="pattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                      <rect width="100%" height="100%" fill="url(%23grad)"/>
                      <rect width="2" height="40" fill="%23FFFFFF20" x="20" y="0"/>
                      <rect width="40" height="2" fill="%23FFFFFF20" x="0" y="20"/>
                    </pattern>
                  </defs>
                  <!-- Background with opacity -->
                  <rect width="${containerWidth}" height="${containerHeight}" fill="${bgColor}" opacity="${bgOpacity}"/>
                  <!-- Full size scratch pattern - REMOVED BORDER RADIUS -->
                  <rect width="${containerWidth}" height="${containerHeight}" fill="url(%23pattern)" stroke="%23FFC107" strokeWidth="4"/>
                  
                  <!-- Gift Box SVG centered in the card -->
                  <g transform="translate(${containerWidth / 2 - 32}, ${containerHeight / 2 - 32}) scale(${isMobile ? 0.8 : 1})">
                    <!-- Circular Border -->
                    <circle cx="32" cy="32" r="30" fill="none" stroke="white" strokeWidth="2"/>

                    <!-- Gift Box Icon -->
                    <!-- Bottom box -->
                    <rect x="20" y="28" width="24" height="18" rx="2" fill="none" stroke="white" strokeWidth="2"/>
                    
                    <!-- Lid -->
                    <rect x="18" y="24" width="28" height="6" rx="1" fill="none" stroke="white" strokeWidth="2"/>

                    <!-- Ribbon vertical -->
                    <line x1="32" y1="24" x2="32" y2="46" stroke="white" strokeWidth="2"/>

                    <!-- Ribbon bows -->
                    <path d="M32 24 C28 18, 24 18, 24 22 C24 25, 28 26, 32 24" fill="none" stroke="white" strokeWidth="2"/>
                    <path d="M32 24 C36 18, 40 18, 40 22 C40 25, 36 26, 32 24" fill="none" stroke="white" strokeWidth="2"/>
                  </g>
                </svg>`}
                finishPercent={80} // Increased from 70 to 80 to match Safari
                onComplete={onScratchComplete}
                brushSize={isMobile ? 40 : 30} // Larger brush size for mobile
                customBrush={undefined}
              >
                <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: card.color }}>
                  <div className="text-center">
                    <div className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold text-white`}>{card.value}</div>
                    <div className={`${isMobile ? "text-xs" : "text-sm"} mt-1 text-white`}>{card.title}</div>
                  </div>
                </div>
              </ScratchCard>
            )}
          </div>
        ) : (
          // Unscratched card preview (not in modal)
          <div className="h-full w-full flex items-center justify-center bg-yellow-400">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <rect x="8" y="10" width="8" height="6" rx="1" stroke="white" strokeWidth="2" />
                <rect x="7" y="8" width="10" height="2" rx="1" stroke="white" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 bg-white dark:bg-[#090e17]">
        <p className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-center text-gray-700 dark:text-gray-300`}>
          {card.isScratched ? "Scratched!" : inModal ? "Scratch to reveal your reward!" : "Click to reveal"}
        </p>
      </div>
    </div>
  )
}
