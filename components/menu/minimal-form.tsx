"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { X, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import GreetingCard from "./greeting-card"

interface MinimalFormProps {
  onSubmit: () => void
  onClose: () => void
  initialData?: {
    name?: string
    phone?: string
    dateOfBirth?: string
  }
  message?: string
  websiteId?: string
}

export default function MinimalForm({ onSubmit, onClose, initialData, message, websiteId }: MinimalFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<{ day: string; month: string; year: string }>(() => {
    if (initialData?.dateOfBirth) {
      const [year, month, day] = initialData.dateOfBirth.split("-")
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return {
        day,
        month: monthNames[Number.parseInt(month) - 1],
        year,
      }
    }
    return { day: "", month: "", year: "" }
  })
  const [activeColumn, setActiveColumn] = useState<"day" | "month" | "year">("day")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "already-registered">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // Add a new state for showing the greeting card
  const [showGreetingCard, setShowGreetingCard] = useState(false)
  const [existingUserData, setExistingUserData] = useState<{
    name: string
    phone: string
    dateOfBirth: string
    websiteIds: string[]
  } | null>(null)
  const [hasUserData, setHasUserData] = useState(false)
  const [showForm, setShowForm] = useState(true)

  const datePickerRef = useRef<HTMLDivElement>(null)
  const dayListRef = useRef<HTMLDivElement>(null)
  const monthListRef = useRef<HTMLDivElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)

  // Generate arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"))
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i))

  // Enhanced function to check for user data in localStorage
  const checkUserData = () => {
    try {
      console.log("Checking localStorage for user data...")

      // Get all userData entries from localStorage
      const userDataEntries: Record<string, any> = {}
      const websiteIds: string[] = []

      // Check for specific website ID first
      if (websiteId) {
        const specificKey = `userData_${websiteId}`
        const specificData = localStorage.getItem(specificKey)

        if (specificData) {
          console.log(`Found user data for current website ID: ${specificKey}`, specificData)
          try {
            const parsedData = JSON.parse(specificData)
            return {
              data: parsedData,
              matchesCurrentWebsite: true,
              websiteIds: [websiteId],
            }
          } catch (e) {
            console.error("Error parsing data:", e)
          }
        }
      }

      // Check all localStorage entries for userData keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userData_")) {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              const parsedData = JSON.parse(data)
              const id = key.replace("userData_", "")
              userDataEntries[id] = parsedData
              websiteIds.push(id)
            } catch (e) {
              console.error(`Error parsing data for ${key}:`, e)
            }
          }
        }
      }

      // If we found any entries
      if (websiteIds.length > 0) {
        // Use the first entry as our data
        const firstId = websiteIds[0]
        const userData = userDataEntries[firstId]

        console.log(`Using user data from website ID: ${firstId}`, userData)
        return {
          data: userData,
          matchesCurrentWebsite: websiteId ? websiteIds.includes(websiteId) : false,
          websiteIds,
        }
      }

      console.log("No user data found in localStorage")
      return null
    } catch (error) {
      console.error("Error checking localStorage:", error)
      return null
    }
  }

  // Check for user data on component mount
  useEffect(() => {
    // Extract websiteId from URL if not provided as prop
    const extractWebsiteIdFromURL = () => {
      if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/")
        // URL pattern is /websiteId/outletId, so websiteId should be the first part after the initial /
        if (pathParts.length >= 2 && pathParts[1]) {
          return pathParts[1]
        }
      }
      return null
    }

    const effectiveWebsiteId = websiteId || extractWebsiteIdFromURL()
    console.log("Using website ID:", effectiveWebsiteId)

    try {
      // Check if greeting card has already been shown in this session
      if (effectiveWebsiteId) {
        const greetingShown = sessionStorage.getItem(`greetingShown_${effectiveWebsiteId}`)
        if (greetingShown) {
          console.log("Greeting card already shown in this session")
          onSubmit() // Skip showing the form
          return
        }
      }

      // First check if we have data for this specific website ID
      if (effectiveWebsiteId) {
        const storageKey = `userData_${effectiveWebsiteId}`
        const storedUserData = localStorage.getItem(storageKey)

        if (storedUserData) {
          console.log("Found user data for current website ID")
          try {
            const parsedData = JSON.parse(storedUserData)
            // Show greeting card with existing data - only if not shown yet in this session
            setExistingUserData({
              name: parsedData.name,
              phone: parsedData.phone,
              dateOfBirth: parsedData.dateOfBirth,
              websiteIds: [effectiveWebsiteId],
            })
            setShowGreetingCard(true)

            // Auto-submit after a short delay to show the greeting card
            setTimeout(() => {
              onSubmit() // Close the form after showing greeting
            }, 200000)
            return
          } catch (e) {
            console.error("Error parsing stored data:", e)
          }
        }
      }

      // If no data for current website ID, check for ANY user data
      let foundUserData = null
      let foundWebsiteId = null

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userData_")) {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              foundUserData = JSON.parse(data)
              foundWebsiteId = key.replace("userData_", "")
              console.log(`Found user data from different website ID: ${foundWebsiteId}`, foundUserData)
              break
            } catch (e) {
              console.error(`Error parsing data for ${key}:`, e)
            }
          }
        }
      }

      if (foundUserData && effectiveWebsiteId) {
        // We found data from a different website ID, show greeting card and auto-submit
        setExistingUserData({
          name: foundUserData.name,
          phone: foundUserData.phone,
          dateOfBirth: foundUserData.dateOfBirth,
          websiteIds: [foundWebsiteId],
        })
        setShowGreetingCard(true)

        // Auto-submit after a short delay to show the greeting card and register with new website
        setTimeout(() => {
          handleGreetingCardSubmit()
        }, 200000)
      } else {
        // No user data found anywhere, show the form
        setShowForm(true)
      }
    } catch (error) {
      console.error("Error checking localStorage:", error)
      setShowForm(true)
    }
  }, [websiteId])

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset to day column when opening
  useEffect(() => {
    if (showDatePicker) {
      setActiveColumn("day")
    }
  }, [showDatePicker])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleDateChange = (type: "day" | "month" | "year", value: string) => {
    setSelectedDate((prev) => ({ ...prev, [type]: value }))

    // Auto-advance to next column or close if all selected
    if (type === "day") {
      setActiveColumn("month")
    } else if (type === "month") {
      setActiveColumn("year")
    } else if (type === "year") {
      // Close picker after selecting year
      setTimeout(() => {
        setShowDatePicker(false)
      }, 300)
    }
  }

  const formatDateForAPI = () => {
    if (!selectedDate.day || !selectedDate.month || !selectedDate.year) {
      return null
    }

    const monthIndex = months.indexOf(selectedDate.month) + 1
    const formattedMonth = String(monthIndex).padStart(2, "0")

    return `${selectedDate.year}-${formattedMonth}-${selectedDate.day}`
  }

  // Update the handleGreetingCardSubmit function to mark greeting as shown in sessionStorage
  const handleGreetingCardSubmit = async () => {
    if (!existingUserData) return

    setIsSubmitting(true)

    // Extract websiteId from URL if not provided as prop
    const extractWebsiteIdFromURL = () => {
      if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/")
        if (pathParts.length >= 2 && pathParts[1]) {
          return pathParts[1]
        }
      }
      return null
    }

    const effectiveWebsiteId = websiteId || extractWebsiteIdFromURL()

    if (!effectiveWebsiteId) {
      console.error("Website ID could not be determined")
      setIsSubmitting(false)
      return
    }

    try {
      // Store the data in localStorage first, regardless of API response
      const storageKey = `userData_${effectiveWebsiteId}`
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          name: existingUserData.name,
          phone: existingUserData.phone,
          dateOfBirth: existingUserData.dateOfBirth,
        }),
      )

      // Mark that greeting has been shown in this session
      sessionStorage.setItem(`greetingShown_${effectiveWebsiteId}`, "true")

      // Always send data to the API, even if the website ID matches
      const payload = {
        name: existingUserData.name,
        mobileNumber: existingUserData.phone,
        dateofBirth: existingUserData.dateOfBirth,
        websiteProjectId: effectiveWebsiteId,
        websiteId: effectiveWebsiteId,
      }

      console.log("Submitting user data to API:", payload)

      // Make the API request
      fetch(
        "https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder/website/customer/register-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          mode: "cors",
        },
      ).catch((error) => {
        console.error("API error (non-blocking):", error)
      })

      // Close the form regardless of API response
      onSubmit()
    } catch (error) {
      console.error("Error submitting existing user data:", error)
      // Still close the form even if there's an error
      onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDebugInfo(null)

    // Form validation
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name")
      setSubmitStatus("error")
      return
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your phone number")
      setSubmitStatus("error")
      return
    }

    const formattedDate = formatDateForAPI()
    if (!formattedDate) {
      setErrorMessage("Please select your date of birth")
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    // Extract websiteId from URL if not provided as prop
    const extractWebsiteIdFromURL = () => {
      if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/")
        // URL pattern is /websiteId/outletId, so websiteId should be the first part after the initial /
        if (pathParts.length >= 2 && pathParts[1]) {
          return pathParts[1]
        }
      }
      return null
    }

    const effectiveWebsiteId = websiteId || extractWebsiteIdFromURL()

    if (!effectiveWebsiteId) {
      setErrorMessage("Website ID could not be determined")
      setSubmitStatus("error")
      setIsSubmitting(false)
      return
    }

    // Store data in localStorage first, regardless of API response
    const userData = {
      name: formData.name,
      phone: formData.phone,
      dateOfBirth: formattedDate,
    }
    const storageKey = `userData_${effectiveWebsiteId}`
    localStorage.setItem(storageKey, JSON.stringify(userData))

    // Prepare the payload with websiteProjectId
    const payload = {
      name: formData.name,
      mobileNumber: formData.phone,
      dateofBirth: formattedDate,
      websiteProjectId: effectiveWebsiteId, // Use the extracted or provided websiteId
      websiteId: effectiveWebsiteId, // Use the same ID for both fields
    }

    // Log the payload for debugging
    console.log("Submitting payload:", payload)

    try {
      // Make the API request
      fetch(
        "https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder/website/customer/register-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          mode: "cors", // Ensure CORS is enabled
        },
      ).catch((error) => {
        console.error("API error (non-blocking):", error)
      })

      // Call onSubmit immediately without waiting for API response
      onSubmit()
    } catch (error) {
      console.error("Registration error:", error)
      // Still call onSubmit even if there's an error
      onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format the selected date for display - show partial selections
  const getFormattedDate = () => {
    if (!selectedDate.day && !selectedDate.month && !selectedDate.year) {
      return "dd-mm-yyyy"
    }

    let result = ""

    // Day part
    if (selectedDate.day) {
      result += selectedDate.day
    } else {
      result += "dd"
    }

    result += "-"

    // Month part
    if (selectedDate.month) {
      result += String(months.indexOf(selectedDate.month) + 1).padStart(2, "0")
    } else {
      result += "mm"
    }

    result += "-"

    // Year part
    if (selectedDate.year) {
      result += selectedDate.year
    } else {
      result += "yyyy"
    }

    return result
  }

  const formattedDate = getFormattedDate()
  const isPlaceholder = formattedDate === "dd-mm-yyyy"

  // Show greeting card if we have existing user data
  if (showGreetingCard && existingUserData) {
    return (
      <GreetingCard
        name={existingUserData.name}
        onClose={() => setShowGreetingCard(false)}
        onSubmit={handleGreetingCardSubmit}
        isSubmitting={isSubmitting}
        websiteId={websiteId}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-[8px] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md m-3 relative rounded-xl border-[1px] backdrop-blur-[15px] border-black/30 bg-white p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/90 hover:text-black"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black">Feast for Less!</h2>
          <p className="text-black/70 mt-1">Sign up & unlock Exclusive offers</p>
        </div>

        {message && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-yellow-700 text-sm">{message}</p>
          </div>
        )}

        {submitStatus === "success" || submitStatus === "already-registered" ? (
          // Don't show any success message, the form will be closed by onSubmit
          <div className="hidden"></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitStatus === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col items-start">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>

                {debugInfo && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded w-full overflow-auto">
                    <p className="font-mono">{debugInfo}</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-black/80 text-sm">
                Full Name
              </label>
              <input
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-transparent border border-black/30 rounded-xl p-2.5 text-black placeholder:text-black/50 focus:outline-none focus:border-black"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-black/80 text-sm">
                Phone Number
              </label>
              <input
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXXXXXXX"
                className="w-full bg-transparent border border-black/30 rounded-xl p-2.5 text-black placeholder:text-black/50 focus:outline-none focus:border-black"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dob" className="block text-black/80 text-sm">
                Date of Birth
              </label>
              <div className="relative">
                <div
                  onClick={() => !isSubmitting && setShowDatePicker(!showDatePicker)}
                  className={`w-full bg-transparent border border-black/30 rounded-xl p-2.5 text-black cursor-pointer flex justify-between items-center ${
                    isSubmitting ? "opacity-70" : ""
                  }`}
                >
                  <span className={isPlaceholder ? "text-black/50" : "text-black"}>{formattedDate}</span>
                  <Calendar size={18} className="text-black/50" />
                </div>

                {/* Custom Date Picker */}
                <AnimatePresence>
                  {showDatePicker && (
                    <motion.div
                      ref={datePickerRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-10 mt-1 w-full bg-white border border-black/20 rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex border-b border-black/10">
                        <div
                          className={`flex-1 text-center font-medium py-2 ${
                            activeColumn === "day" ? "text-[#ea580c]" : "text-black/70"
                          }`}
                        >
                          Day
                        </div>
                        <div
                          className={`flex-1 text-center font-medium py-2 ${
                            activeColumn === "month" ? "text-[#ea580c]" : "text-black/70"
                          }`}
                        >
                          Month
                        </div>
                        <div
                          className={`flex-1 text-center font-medium py-2 ${
                            activeColumn === "year" ? "text-[#ea580c]" : "text-black/70"
                          }`}
                        >
                          Year
                        </div>
                      </div>

                      {/* Date Picker Body */}
                      <div className="flex">
                        {/* Days Column */}
                        <div
                          className={`flex-1 ${activeColumn !== "day" ? "opacity-50" : ""}`}
                          onClick={() => setActiveColumn("day")}
                        >
                          <div className="overflow-y-auto h-[120px] scrollbar-hide" ref={dayListRef}>
                            {days.map((day, index) => (
                              <div
                                key={day}
                                className={`h-[40px] flex items-center justify-center cursor-pointer ${
                                  index % 2 === 1 ? "bg-black/5" : ""
                                } ${selectedDate.day === day ? "text-[#ea580c] font-medium" : "text-black/60"}`}
                                onClick={() => handleDateChange("day", day)}
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Months Column */}
                        <div
                          className={`flex-1 ${activeColumn !== "month" ? "opacity-50" : ""}`}
                          onClick={() => setActiveColumn("month")}
                        >
                          <div className="overflow-y-auto h-[120px] scrollbar-hide" ref={monthListRef}>
                            {months.map((month, index) => (
                              <div
                                key={month}
                                className={`h-[40px] flex items-center justify-center cursor-pointer ${
                                  index % 2 === 1 ? "bg-black/5" : ""
                                } ${selectedDate.month === month ? "text-[#ea580c] font-medium" : "text-black/60"}`}
                                onClick={() => handleDateChange("month", month)}
                              >
                                {month}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Years Column */}
                        <div
                          className={`flex-1 ${activeColumn !== "year" ? "opacity-50" : ""}`}
                          onClick={() => setActiveColumn("year")}
                        >
                          <div className="overflow-y-auto h-[120px] scrollbar-hide" ref={yearListRef}>
                            {years.map((year, index) => (
                              <div
                                key={year}
                                className={`h-[40px] flex items-center justify-center cursor-pointer ${
                                  index % 2 === 1 ? "bg-black/5" : ""
                                } ${selectedDate.year === year ? "text-[#ea580c] font-medium" : "text-black/60"}`}
                                onClick={() => handleDateChange("year", year)}
                              >
                                {year}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Hidden field for websiteProjectId */}
            {websiteId && <input type="hidden" name="websiteProjectId" value={websiteId} />}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-[#ea580c] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
