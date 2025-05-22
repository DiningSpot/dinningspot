import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "./theme-provider"
 
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dinning Spot | Next Gen Food Menu",
  description: "Browse through delicious menu items with a digital touch at you handset",
  openGraph: {
    title: "Dinning Spot | Next Gen Food Menu",
    description: "Browse through delicious menu items with a digital touch at you handset",
    images: [
      {
        url: "/meta.jpg",
        width: 1200,
        height: 630,
        alt: "Dinning Spot Menu Preview",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
