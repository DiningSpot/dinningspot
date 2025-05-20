"use client"
import { Share2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  className?: string
}

export default function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowShareOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleShare = () => {
    setShowShareOptions(!showShareOptions)
  }

  // Copy to clipboard function
  const copyToClipboard = () => {
    const textToCopy = url || window.location.href

    // Use the clipboard API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert("Link copied to clipboard!")
        })
        .catch((err) => {
          console.error("Could not copy text: ", err)
          // Fallback for clipboard API failure
          fallbackCopyToClipboard(textToCopy)
        })
    } else {
      // Fallback for browsers without clipboard API
      fallbackCopyToClipboard(textToCopy)
    }

    setShowShareOptions(false)
  }

  // Fallback copy method using a temporary input element
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed" // Avoid scrolling to bottom
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand("copy")
      alert("Link copied to clipboard!")
    } catch (err) {
      console.error("Fallback: Could not copy text: ", err)
      alert("Failed to copy link. Please copy the URL manually.")
    }

    document.body.removeChild(textArea)
  }

  // Share via social media
  const shareVia = (platform: string) => {
    const shareUrl = url || window.location.href
    let shareLink = ""

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`
        break
      default:
        return
    }

    // Open in a new window
    window.open(shareLink, "_blank", "noopener,noreferrer")
    setShowShareOptions(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={`text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 ${className}`}
        aria-label="Share"
      >
        <Share2 size={20} />
      </button>

      {/* Share options dropdown */}
      {showShareOptions && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50"
        >
          <div className="py-1">
            <button
              onClick={() => shareVia("facebook")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Share on Facebook
            </button>
            <button
              onClick={() => shareVia("twitter")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Share on Twitter
            </button>
            <button
              onClick={() => shareVia("whatsapp")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Share on WhatsApp
            </button>
            <button
              onClick={copyToClipboard}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
