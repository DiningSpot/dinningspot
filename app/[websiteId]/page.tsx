import Link from "next/link"
import { Utensils } from "lucide-react"

interface Outlet {
  _id: string
  outletName: string
}

interface PageProps {
  params: {
    websiteId: string
  }
}

const API_BASE_URL = "https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder"

// Array of background colors for the cards
const cardColors = [
  "bg-gradient-to-br from-orange-400 to-orange-500",
  "bg-gradient-to-br from-emerald-400 to-emerald-500",
  "bg-gradient-to-br from-purple-400 to-purple-500",
  "bg-gradient-to-br from-blue-400 to-blue-500",
  "bg-gradient-to-br from-pink-400 to-pink-500",
  "bg-gradient-to-br from-amber-400 to-amber-500",
]

async function fetchOutlets(websiteId: string) {
  const response = await fetch(`${API_BASE_URL}/website/outlet-management/get-all-outlets/${websiteId}`)
  if (!response.ok) throw new Error("Could not fetch outlets")
  const data = await response.json()
  return data.data.data || []
}

export default async function Home({ params }: PageProps) {
  const { websiteId } = params
  let outlets: Outlet[] = []
  let error = null

  try {
    outlets = await fetchOutlets(websiteId)
  } catch (err) {
    console.error("Error fetching outlets:", err)
    error = "Failed to load outlets. Please try again later."
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Outlets</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our delicious offerings across various outlets. Click on any outlet to view the full menu.
          </p>
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : outlets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No outlets found for this website.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet, index) => (
              <Link key={outlet._id} href={`/${websiteId}/${outlet._id}`} className="block">
                <div
                  className={`${cardColors[index % cardColors.length]} rounded-xl overflow-hidden shadow-lg text-white text-center p-8`}
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      <Utensils className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{outlet.outletName}</h2>
                  <p className="mb-6">Explore our menu selection</p>
                  <div className="inline-block border-2 border-white rounded-full px-6 py-2 font-medium hover:bg-white/20 transition-colors">
                    View Menu
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
