"use client"

import MenuCard from "@/app/menu-card"
import { useParams } from "next/navigation"

export default function MenuCardPage() {
  const { categoryId } = useParams()
  return <MenuCard outletId={categoryId as string} />
}
