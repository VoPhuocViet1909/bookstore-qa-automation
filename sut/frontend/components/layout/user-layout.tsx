"use client"

import { Header } from "./header"
import { Footer } from "./footer"
import type React from "react"

export function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
