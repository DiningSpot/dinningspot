"use client"
import { useState, useRef, useEffect } from "react"
import React from "react"
import { X, Loader2, AlertCircle } from "lucide-react"
import { API_BASE_URL } from "@/constants"
import MinimalForm from "./minimal-form"
import GreetingCard from "./greeting-card"

interface FeedbackPageProps {
  onClose: () => void
  websiteId: string
}

interface FeedbackFormState {
  name: string
  mobileNumber: string
  overallExperience: string
  foodQuality: string
  staffService: string
  cleanliness: string
  remarks: string
  attachments: File[]
  attachmentPreviews: string[]
}

interface UserData {
  name: string
  phone: string
  dateOfBirth: string
}

export default function FeedbackPage({ onClose, websiteId }: FeedbackPageProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showGreetingCard, setShowGreetingCard] = useState(false)
  const [formMessage, setFormMessage] = useState("")
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormState>({
    name: "",
    mobileNumber: "",
    overallExperience: "",
    foodQuality: "",
    staffService: "",
    cleanliness: "",
    remarks: "",
    attachments: [],
    attachmentPreviews: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [dataChecked, setDataChecked] = useState(false)

  // Enhanced function to check for user data in localStorage
  const checkUserData = () => {
    try {
      console.log("Checking localStorage for user data...")

      // Check for specific website ID first
      if (websiteId) {
        const specificKey = `userData_${websiteId}`
        const specificData = localStorage.getItem(specificKey)

        if (specificData) {
          console.log(`Found user data for current website ID: ${specificKey}`, specificData)
          try {
            return {
              data: JSON.parse(specificData),
              matchesCurrentWebsite: true,
            }
          } catch (e) {
            console.error("Error parsing data:", e)
          }
        }
      }

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

      if (effectiveWebsiteId) {
        const specificKey = `userData_${effectiveWebsiteId}`
        const specificData = localStorage.getItem(specificKey)

        if (specificData) {
          console.log(`Found user data for current website ID from URL: ${specificKey}`, specificData)
          try {
            return {
              data: JSON.parse(specificData),
              matchesCurrentWebsite: true,
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

              console.log(`Found user data from different website ID: ${id}`, parsedData)
              return {
                data: parsedData,
                matchesCurrentWebsite: false,
                fromWebsiteId: id,
              }
            } catch (e) {
              console.error(`Error parsing data for ${key}:`, e)
            }
          }
        }
      }

      // Check for generic userData key as fallback
      const genericData = localStorage.getItem("userData")
      if (genericData) {
        console.log("Found user data with generic key", genericData)
        try {
          return {
            data: JSON.parse(genericData),
            matchesCurrentWebsite: false,
          }
        } catch (e) {
          console.error("Error parsing generic userData:", e)
        }
      }

      console.log("No user data found in localStorage")
      return null
    } catch (error) {
      console.error("Error checking localStorage:", error)
      return null
    }
  }

  // Function to register user data with the current website
  const registerUserWithCurrentWebsite = async (userData: UserData) => {
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
      return false
    }

    try {
      // Prepare the payload with websiteProjectId
      const payload = {
        name: userData.name,
        mobileNumber: userData.phone,
        dateofBirth: userData.dateOfBirth,
        websiteProjectId: effectiveWebsiteId,
        websiteId: effectiveWebsiteId,
      }

      console.log("Registering existing user with current website:", payload)

      // Make the API request
      const response = await fetch(
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
      )

      // Only store in localStorage if the API call was successful
      if (response.ok) {
        // Store the data for the new website ID
        const storageKey = `userData_${effectiveWebsiteId}`
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            dateOfBirth: userData.dateOfBirth,
          }),
        )
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to register user")
      }
    } catch (error) {
      console.error("Error registering user with current website:", error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check for user data in localStorage when component mounts
  useEffect(() => {
    const userDataResult = checkUserData()

    if (userDataResult) {
      if (userDataResult.matchesCurrentWebsite) {
        // If data is from current website, use it directly
        console.log("Using data from current website")
        setUserData(userDataResult.data)
      } else {
        // If data is from a different website, show greeting card and register with current website
        console.log("Found data from different website, showing greeting card")
        setUserData(userDataResult.data)
        setShowGreetingCard(true)
      }
    } else {
      // No user data found, show the form
      setShowUserForm(true)
    }

    setDataChecked(true)
  }, [websiteId])

  const handleFeedbackChange = (field: keyof FeedbackFormState, value: string) => {
    setFeedbackForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

      setFeedbackForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
        attachmentPreviews: [...prev.attachmentPreviews, ...newPreviews],
      }))
    }
  }

  const removeAttachment = (index: number) => {
    setFeedbackForm((prev) => {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(prev.attachmentPreviews[index])

      const newAttachments = [...prev.attachments]
      const newPreviews = [...prev.attachmentPreviews]
      newAttachments.splice(index, 1)
      newPreviews.splice(index, 1)

      return {
        ...prev,
        attachments: newAttachments,
        attachmentPreviews: newPreviews,
      }
    })
  }

  const validateForm = (): boolean => {
    if (!feedbackForm.overallExperience) {
      setErrorMessage("Please rate your overall experience")
      return false
    }

    return true
  }

  const handleUserFormSubmit = () => {
    setShowUserForm(false)

    // Refresh user data from localStorage
    const userDataResult = checkUserData()
    if (userDataResult) {
      setUserData(userDataResult.data)

      // If we've attempted to submit before, now we can actually submit
      if (attemptedSubmit) {
        submitFeedback()
      }
    }
  }

  const handleUserFormClose = () => {
    setShowUserForm(false)
    // Don't submit the form if the user closes the MinimalForm
    // If they've attempted to submit before, show the form again with a message
    if (attemptedSubmit) {
      setFormMessage("Please fill out your information to submit your feedback.")
      setShowUserForm(true)
    }
  }

  // Handle greeting card submission
  const handleGreetingCardSubmit = async () => {
    if (!userData) return

    const success = await registerUserWithCurrentWebsite(userData)
    if (success) {
      setShowGreetingCard(false)
    } else {
      // If registration fails, show the form
      setShowGreetingCard(false)
      setShowUserForm(true)
    }
  }

  // Replace the submitFeedback function with this version
  const submitFeedback = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!validateForm()) {
      setSubmitStatus("error")
      return
    }

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
      setErrorMessage("Website ID could not be determined")
      setSubmitStatus("error")
      return
    }

    // ALWAYS check localStorage first, regardless of component state
    const userDataResult = checkUserData()

    // If we found data in localStorage, use it and update state
    if (userDataResult) {
      console.log("Using stored user data for submission:", userDataResult.data)
      setUserData(userDataResult.data)

      // If data is from a different website, register with current website first
      if (!userDataResult.matchesCurrentWebsite) {
        const success = await registerUserWithCurrentWebsite(userDataResult.data)
        if (!success) {
          setErrorMessage("Failed to register with current website")
          setSubmitStatus("error")
          return
        }
      }

      // Proceed with submission using the localStorage data
      proceedWithSubmission(userDataResult.data)
      return // Important: return early to prevent showing the form
    }

    // If no data in localStorage and none in state, show the form
    if (!userData) {
      console.log("No user data found, showing form")
      setAttemptedSubmit(true)
      setFormMessage("Please provide your information to submit feedback")
      setShowUserForm(true)
      return
    }

    // Use the data in state
    console.log("Using state user data for submission:", userData)
    proceedWithSubmission(userData)
  }

  // Separate function to handle the actual submission once we have user data
  const proceedWithSubmission = async (userDataToUse: UserData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

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
      setErrorMessage("Website ID could not be determined")
      setSubmitStatus("error")
      setIsSubmitting(false)
      return
    }

    try {
      // Get all image file names as a single array
      const imageFileNames = feedbackForm.attachments.map((file) => file.name)

      // Prepare the payload according to the API requirements
      const payload = {
        websiteProjectId: effectiveWebsiteId, // Use websiteProjectId
        websiteId: effectiveWebsiteId, // Also include websiteId for backward compatibility
        name: userDataToUse.name,
        mobileNumber: userDataToUse.phone,
        remarks: feedbackForm.remarks,
        stringOne: feedbackForm.overallExperience,
        stringTwo: feedbackForm.foodQuality,
        stringThree: feedbackForm.staffService,
        stringFour: feedbackForm.cleanliness,
        arrayOne: imageFileNames, // All images in a single array
        enquiryId: "68272ea9ff4b7ea66624ef2c", // Add the fixed enquiry ID to all feedback submissions
      }

      console.log("Submitting feedback payload:", payload)

      // Make the API request
      const response = await fetch(`${API_BASE_URL}/website/feedback/create-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit feedback")
      }

      // Success
      setSubmitStatus("success")

      // Clear form after successful submission
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear object URLs when component unmounts to prevent memory leaks
  React.useEffect(() => {
    return () => {
      feedbackForm.attachmentPreviews.forEach((preview) => URL.revokeObjectURL(preview))
    }
  }, [])

  // Show greeting card if needed
  if (showGreetingCard && userData) {
    return (
      <GreetingCard
        name={userData.name}
        onClose={() => setShowGreetingCard(false)}
        onSubmit={handleGreetingCardSubmit}
        isSubmitting={isSubmitting}
        websiteId={websiteId}
      />
    )
  }

  // If showing the user form, render the MinimalForm component
  if (showUserForm) {
    return (
      <MinimalForm
        onSubmit={handleUserFormSubmit}
        onClose={handleUserFormClose}
        initialData={
          userData
            ? {
                name: userData.name,
                phone: userData.phone,
                dateOfBirth: userData.dateOfBirth,
              }
            : undefined
        }
        message={formMessage}
        websiteId={websiteId}
      />
    )
  }

  // Rest of the component remains the same...
  return (
    <div className="fixed inset-0 bg-purple-50 dark:bg-[#090e17] z-50 overflow-y-auto">
      {/* Existing feedback form UI */}
      {/* ... */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-purple-600 dark:text-purple-500">Feedback</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {submitStatus === "success" ? (
          <div className="py-8 text-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600 dark:text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Thank You For Your Feedback!</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We appreciate you taking the time to share your thoughts with us.
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => submitFeedback(e)} className="space-y-4">
            {submitStatus === "error" && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
                <p>{errorMessage}</p>
              </div>
            )}

            {attemptedSubmit && !showUserForm && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  Please fill out your information to submit your feedback.
                </p>
              </div>
            )}

            {/* Overall Experience */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How would you rate your overall dining experience with us today?
              </label>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("overallExperience", "Bad")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.overallExperience === "Bad"
                        ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😞</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Bad</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("overallExperience", "Average")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.overallExperience === "Average"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😐</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Average</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("overallExperience", "Good")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.overallExperience === "Good"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">🙂</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Good</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("overallExperience", "Best")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.overallExperience === "Best"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😄</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Best</span>
                </div>
              </div>
            </div>

            {/* Rest of the form remains the same */}
            {/* ... */}

            {/* Food Quality */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How satisfied were you with the taste and quality of the food?
              </label>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("foodQuality", "Bad")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.foodQuality === "Bad"
                        ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😞</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Bad</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("foodQuality", "Average")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.foodQuality === "Average"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😐</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Average</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("foodQuality", "Good")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.foodQuality === "Good"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">🙂</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Good</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("foodQuality", "Best")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.foodQuality === "Best"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😄</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Best</span>
                </div>
              </div>
            </div>

            {/* Staff Service */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Was our staff friendly and attentive during your visit?
              </label>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("staffService", "Bad")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.staffService === "Bad"
                        ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😞</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Bad</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("staffService", "Average")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.staffService === "Average"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😐</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Average</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("staffService", "Good")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.staffService === "Good"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">🙂</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Good</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("staffService", "Best")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.staffService === "Best"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😄</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Best</span>
                </div>
              </div>
            </div>

            {/* Cleanliness */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How would you rate the cleanliness and ambiance of the restaurant?
              </label>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("cleanliness", "Bad")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.cleanliness === "Bad"
                        ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😞</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Bad</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("cleanliness", "Average")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.cleanliness === "Average"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😐</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Average</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("cleanliness", "Good")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.cleanliness === "Good"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">🙂</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Good</span>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleFeedbackChange("cleanliness", "Best")}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                      feedbackForm.cleanliness === "Best"
                        ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <span className="text-2xl">😄</span>
                  </button>
                  <span className="text-xs dark:text-gray-300">Best</span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Do you have any suggestions or feedback to help us improve?
              </label>
              <textarea
                id="remarks"
                value={feedbackForm.remarks}
                onChange={(e) => handleFeedbackChange("remarks", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                rows={4}
                placeholder="Your suggestions..."
              ></textarea>
            </div>

            {/* Attachments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Attachments (Images)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4">
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileAttachment}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload images</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">JPG, PNG files are supported</span>
                </label>
              </div>

              {/* Display attached files */}
              {feedbackForm.attachmentPreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attached Files ({feedbackForm.attachmentPreviews.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {feedbackForm.attachmentPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Attachment ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
