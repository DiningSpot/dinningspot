"use client"
import { X } from "lucide-react"

interface SidebarMenuProps {
  isOpen: boolean
  onClose: () => void
  subCategories: { _id: string; name: string }[]
  selectedSubCategoryId: string | null
  onCategoryClick: (id: string | null) => void
  getProductCount: (id: string | null) => number
  productsCount: number
}

export default function SidebarMenu({
  isOpen,
  onClose,
  subCategories,
  selectedSubCategoryId,
  onCategoryClick,
  getProductCount,
  productsCount,
}: SidebarMenuProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-20" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white dark:bg-[#090e17] shadow-xl z-30 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-orange-600 dark:text-orange-500">Categories</h3>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2">
            <button
              className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                !selectedSubCategoryId
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => onCategoryClick(null)}
            >
              <div className="flex justify-between items-center">
                <span>All Items</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{productsCount}</span>
              </div>
            </button>

            {subCategories?.length > 0 &&
              subCategories
                .filter((sub) => sub && sub._id)
                .map((sub) => (
                  <button
                    key={sub._id}
                    className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                      selectedSubCategoryId === sub._id
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => onCategoryClick(sub._id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="capitalize">
                        {sub.name ? sub.name.charAt(0).toUpperCase() + sub.name.slice(1).toLowerCase() : "Unnamed"}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{getProductCount(sub._id)}</span>
                    </div>
                  </button>
                ))}
          </div>
          
        </div>
      </div>
    </>
  )
}
