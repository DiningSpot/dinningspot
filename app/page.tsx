"use client"

import { motion } from "framer-motion"

export default function Home() {
  return null
}

// Food element component
function FoodElement({
  type,
  className,
  size = 100,
  delay = 0,
}: {
  type: string
  className?: string
  size?: number
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2,
        delay,
        y: {
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      }}
    >
      {getFoodSvg(type)}
    </motion.div>
  )
}

// Category icon component
function CategoryIcon({ type }: { type: number }) {
  switch (type) {
    case 0: // Appetizers
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      )
    case 1: // Main Course
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2"></path>
          <path d="M18 15V2"></path>
          <path d="M21 15a3 3 0 1 1-6 0"></path>
        </svg>
      )
    case 2: // Desserts
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8.5 2a6.5 6.5 0 0 0 0 13h7a6.5 6.5 0 1 0 0-13h-7z"></path>
          <path d="M8.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
          <path d="M15.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
          <path d="M15.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
          <path d="M8.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
        </svg>
      )
    default:
      return null
  }
}

// Helper function to get food SVGs
function getFoodSvg(type: string) {
  switch (type) {
    case "croissant":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.6 13.11L7.5 3.5 17.14 6.5l2.86 9.5-12.4 4.14L4.6 13.11z"></path>
          <path d="M7.5 3.5L4.6 13.11"></path>
          <path d="M7.5 3.5l9.64 3"></path>
          <path d="M17.14 6.5l-12.4 10.61"></path>
          <path d="M17.14 6.5l2.86 9.5"></path>
          <path d="M20 16l-12.4 4.14"></path>
        </svg>
      )
    case "coffee":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="2" x2="6" y2="4"></line>
          <line x1="10" y1="2" x2="10" y2="4"></line>
          <line x1="14" y1="2" x2="14" y2="4"></line>
        </svg>
      )
    case "plate":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      )
    case "utensils":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2"></path>
          <path d="M18 15V2"></path>
          <path d="M21 15a3 3 0 1 1-6 0"></path>
        </svg>
      )
    case "leaf":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12.5c1-3 2.5-5.5 5.5-7.5 1.5-1 4-1.5 6-1.5 0 0-1 2-1 4 0 3.5 3 5.5 6 6.5-1 1-2 2-4.5 2.5s-5 .5-7.5-1c-1.5-1-3-2.5-4.5-3z"></path>
          <path d="M15 6c1 .5 2 1.5 3 2.5 2 2 3 4.5 3 7.5 0 2-1 4-2 5"></path>
          <path d="M13 22c2-1 4-2.5 4-6"></path>
        </svg>
      )
    case "cherry":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 17a5 5 0 0 0 10 0c0-2.5-2.5-5-5-5s-5 2.5-5 5Z"></path>
          <path d="M12 17a5 5 0 0 0 10 0c0-2.5-2.5-5-5-5s-5 2.5-5 5Z"></path>
          <path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12"></path>
          <path d="M22 9c-4.29 0-7.14-2.33-10-7 5.71 0 10 4.67 10 7Z"></path>
        </svg>
      )
    case "lemon":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17.8 5.4c-1-1-2.8-1.7-4.3-1.4-2 .4-3.5 1.9-4 4a7.4 7.4 0 0 0 1.7 6.6 7.4 7.4 0 0 0 6.6 1.7c2.1-.5 3.6-2 4-4 .3-1.5-.4-3.4-1.4-4.3"></path>
          <path d="M18.7 4.5c.3-.3.7-.3 1 0s.3.7 0 1"></path>
          <path d="M14.9 8.3a2 2 0 0 0-2.8 0"></path>
          <path d="M9.9 13.4a2 2 0 0 0 0 2.8"></path>
          <path d="M15.1 18.6a2 2 0 0 0 2.8 0"></path>
          <path d="M20.1 13.4a2 2 0 0 0 0-2.8"></path>
        </svg>
      )
    default:
      return null
  }
}
