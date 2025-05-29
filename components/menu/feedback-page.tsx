"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Loader2, AlertCircle } from "lucide-react"
import { API_BASE_URL } from "@/constants"
import MinimalForm from "./minimal-form"
import GreetingCard from "./greeting-card"

interface FeedbackPageProps {
  onClose: () => void
  websiteId: string
  outletId: string
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
  uploadedFileNames: string[]
}

interface UserData {
  name: string
  phone: string
  dateOfBirth: string
}

export default function FeedbackPage({ onClose, websiteId, outletId }: FeedbackPageProps) {
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
    uploadedFileNames: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  // Simplified file upload function
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    console.log(`Starting upload for ${files.length} files`)
    setIsUploadingFiles(true)

    try {
      const uploadedFileNames: string[] = []

      for (const file of files) {
        try {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch(
            "https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder/third-party/file-upload/upload-files",
            {
              method: "POST",
              body: formData,
            },
          )

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`)
          }

          const result = await response.json()

          // Extract file name from response
          if (result?.data?.[0]?.imageNames?.[0]) {
            uploadedFileNames.push(result.data[0].imageNames[0])
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error)
        }
      }

      return uploadedFileNames
    } catch (error) {
      console.error("Error in uploadFiles:", error)
      return []
    } finally {
      setIsUploadingFiles(false)
    }
  }

  // Handle file attachment
  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)

    // Validate file sizes (max 5MB per file)
    const validFiles = newFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`File ${file.name} exceeds 5MB limit`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Generate previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))

    // Update state
    setFeedbackForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
      attachmentPreviews: [...prev.attachmentPreviews, ...newPreviews],
    }))

    // Upload files
    try {
      const uploadedFileNames = await uploadFiles(validFiles)
      setFeedbackForm((prev) => ({
        ...prev,
        uploadedFileNames: [...prev.uploadedFileNames, ...uploadedFileNames],
      }))

      if (uploadedFileNames.length < validFiles.length) {
        setErrorMessage("Some files failed to upload. You can still submit your feedback.")
      } else {
        setErrorMessage("")
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      setErrorMessage("Some files failed to upload. You can still submit your feedback.")
    }
  }

  // Check for user data in localStorage
  const checkUserData = () => {
    try {
      if (websiteId) {
        const specificKey = `userData_${websiteId}`
        const specificData = localStorage.getItem(specificKey)
        if (specificData) {
          return { data: JSON.parse(specificData), matchesCurrentWebsite: true }
        }
      }

      // Check for any user data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("userData_")) {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              return { data: JSON.parse(data), matchesCurrentWebsite: false }
            } catch (e) {
              console.error(`Error parsing data for ${key}:`, e)
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error("Error checking localStorage:", error)
      return null
    }
  }

  // Register user with current website
  const registerUserWithCurrentWebsite = async (userData: UserData) => {
    setIsSubmitting(true)

    try {
      const payload = {
        name: userData.name,
        mobileNumber: userData.phone,
        dateofBirth: userData.dateOfBirth,
        websiteProjectId: websiteId,
        websiteId: websiteId,
      }

      const response = await fetch(
        "https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder/website/customer/register-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )

      if (response.ok) {
        const storageKey = `userData_${websiteId}`
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            dateOfBirth: userData.dateOfBirth,
          }),
        )
        return true
      }
      return false
    } catch (error) {
      console.error("Error registering user:", error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check for user data on mount
  useEffect(() => {
    const userDataResult = checkUserData()

    if (userDataResult) {
      if (userDataResult.matchesCurrentWebsite) {
        setUserData(userDataResult.data)
      } else {
        setUserData(userDataResult.data)
        setShowGreetingCard(true)
      }
    } else {
      setShowUserForm(true)
    }
  }, [websiteId])

  const handleFeedbackChange = (field: keyof FeedbackFormState, value: string) => {
    setFeedbackForm((prev) => ({ ...prev, [field]: value }))
  }

  const removeAttachment = (index: number) => {
    setFeedbackForm((prev) => {
      URL.revokeObjectURL(prev.attachmentPreviews[index])

      const newAttachments = [...prev.attachments]
      const newPreviews = [...prev.attachmentPreviews]
      const newFileNames = [...prev.uploadedFileNames]

      newAttachments.splice(index, 1)
      newPreviews.splice(index, 1)
      if (newFileNames[index]) {
        newFileNames.splice(index, 1)
      }

      return {
        ...prev,
        attachments: newAttachments,
        attachmentPreviews: newPreviews,
        uploadedFileNames: newFileNames,
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
    const userDataResult = checkUserData()
    if (userDataResult) {
      setUserData(userDataResult.data)
      if (attemptedSubmit) {
        submitFeedback()
      }
    }
  }

  const handleUserFormClose = () => {
    setShowUserForm(false)
    if (attemptedSubmit) {
      setFormMessage("Please fill out your information to submit your feedback.")
      setShowUserForm(true)
    }
  }

  const handleGreetingCardSubmit = async () => {
    if (!userData) return

    const success = await registerUserWithCurrentWebsite(userData)
    if (success) {
      setShowGreetingCard(false)
    } else {
      setShowGreetingCard(false)
      setShowUserForm(true)
    }
  }

  const submitFeedback = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validateForm()) {
      setSubmitStatus("error")
      return
    }

    const userDataResult = checkUserData()

    if (userDataResult) {
      setUserData(userDataResult.data)

      if (!userDataResult.matchesCurrentWebsite) {
        const success = await registerUserWithCurrentWebsite(userDataResult.data)
        if (!success) {
          setErrorMessage("Failed to register with current website")
          setSubmitStatus("error")
          return
        }
      }

      proceedWithSubmission(userDataResult.data)
      return
    }

    if (!userData) {
      setAttemptedSubmit(true)
      setFormMessage("Please provide your information to submit feedback")
      setShowUserForm(true)
      return
    }

    proceedWithSubmission(userData)
  }

  const proceedWithSubmission = async (userDataToUse: UserData) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const payload = {
        websiteProjectId: websiteId,
        websiteId: websiteId,
        name: userDataToUse.name,
        mobileNumber: userDataToUse.phone,
        remarks: feedbackForm.remarks,
        strings: {
          stringOne: feedbackForm.overallExperience,
          stringTwo: feedbackForm.foodQuality,
          stringThree: feedbackForm.staffService,
          stringFour: feedbackForm.cleanliness,
        },
        arrays: {
          arrayOne: feedbackForm.uploadedFileNames,
        },
        enquiryId: "68272ea9ff4b7ea66624ef2c",
        outletId: outletId,
      }

      const response = await fetch(`${API_BASE_URL}/website/feedback/create-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit feedback")
      }

      setSubmitStatus("success")
      setTimeout(() => onClose(), 2000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      feedbackForm.attachmentPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview)
      })
    }
  }, [feedbackForm.attachmentPreviews])

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

  return (
    <div className="fixed inset-0 bg-purple-50 dark:bg-[#090e17] z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-purple-600 dark:text-purple-500">Feedback</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={isSubmitting || isUploadingFiles}
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
          <form onSubmit={submitFeedback} className="space-y-4">
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

            {isUploadingFiles && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 flex items-start">
                <Loader2 className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0 animate-spin" />
                <p className="text-blue-700 dark:text-blue-400 text-sm">Uploading images...</p>
              </div>
            )}

            {/* Overall Experience Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How would you rate your overall dining experience with us today?
              </label>
              <div className="flex justify-between items-center">
                {["Bad", "Average", "Good", "Best"].map((rating, index) => {
                  const emojis = ["😞", "😐", "🙂", "😄"]
                  const colors = ["red", "yellow", "green", "green"]
                  return (
                    <div key={rating} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => handleFeedbackChange("overallExperience", rating)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                          feedbackForm.overallExperience === rating
                            ? `bg-${colors[index]}-100 dark:bg-${colors[index]}-900/30 border-2 border-${colors[index]}-500`
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <span className="text-2xl">{emojis[index]}</span>
                      </button>
                      <span className="text-xs dark:text-gray-300">{rating}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Food Quality Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How satisfied were you with the taste and quality of the food?
              </label>
              <div className="flex justify-between items-center">
                {["Bad", "Average", "Good", "Best"].map((rating, index) => {
                  const emojis = ["😞", "😐", "🙂", "😄"]
                  const colors = ["red", "yellow", "green", "green"]
                  return (
                    <div key={rating} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => handleFeedbackChange("foodQuality", rating)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                          feedbackForm.foodQuality === rating
                            ? `bg-${colors[index]}-100 dark:bg-${colors[index]}-900/30 border-2 border-${colors[index]}-500`
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <span className="text-2xl">{emojis[index]}</span>
                      </button>
                      <span className="text-xs dark:text-gray-300">{rating}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Staff Service Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Was our staff friendly and attentive during your visit?
              </label>
              <div className="flex justify-between items-center">
                {["Bad", "Average", "Good", "Best"].map((rating, index) => {
                  const emojis = ["😞", "😐", "🙂", "😄"]
                  const colors = ["red", "yellow", "green", "green"]
                  return (
                    <div key={rating} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => handleFeedbackChange("staffService", rating)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                          feedbackForm.staffService === rating
                            ? `bg-${colors[index]}-100 dark:bg-${colors[index]}-900/30 border-2 border-${colors[index]}-500`
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <span className="text-2xl">{emojis[index]}</span>
                      </button>
                      <span className="text-xs dark:text-gray-300">{rating}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cleanliness Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How would you rate the cleanliness and ambiance of the restaurant?
              </label>
              <div className="flex justify-between items-center">
                {["Bad", "Average", "Good", "Best"].map((rating, index) => {
                  const emojis = ["😞", "😐", "🙂", "😄"]
                  const colors = ["red", "yellow", "green", "green"]
                  return (
                    <div key={rating} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => handleFeedbackChange("cleanliness", rating)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
                          feedbackForm.cleanliness === rating
                            ? `bg-${colors[index]}-100 dark:bg-${colors[index]}-900/30 border-2 border-${colors[index]}-500`
                            : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <span className="text-2xl">{emojis[index]}</span>
                      </button>
                      <span className="text-xs dark:text-gray-300">{rating}</span>
                    </div>
                  )
                })}
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
              />
            </div>

            {/* File Upload */}
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
                  disabled={isUploadingFiles}
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
                    {isUploadingFiles ? (
                      <Loader2 className="h-6 w-6 text-purple-600 dark:text-purple-400 animate-spin" />
                    ) : (
                      <svg
                        className="h-6 w-6 text-purple-600 dark:text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isUploadingFiles ? "Uploading..." : "Click to upload images"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    JPG, PNG files are supported (max 5MB each)
                  </span>
                </label>
              </div>

              {feedbackForm.attachmentPreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attached Files ({feedbackForm.attachmentPreviews.length})
                    {feedbackForm.uploadedFileNames.length > 0 && (
                      <span className="text-green-600 dark:text-green-400 ml-2">
                        ({feedbackForm.uploadedFileNames.length} uploaded)
                      </span>
                    )}
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
                          {feedbackForm.uploadedFileNames[index] && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
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
              disabled={isSubmitting || isUploadingFiles}
              className="w-full bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Submitting...
                </>
              ) : isUploadingFiles ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Uploading Images...
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
