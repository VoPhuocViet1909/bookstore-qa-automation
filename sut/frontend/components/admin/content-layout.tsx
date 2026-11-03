"use client"

import { ReactNode } from "react"

interface ContentLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  className?: string
  // Layout configuration
  sidebarPosition?: "left" | "right"
  sidebarSize?: "sm" | "md" | "lg"
  gap?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "xl:grid-cols-5",
  md: "xl:grid-cols-4", 
  lg: "xl:grid-cols-3"
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4 lg:gap-6",
  lg: "gap-6 lg:gap-8"
}

const mainSpanClasses = {
  sm: "xl:col-span-4",
  md: "xl:col-span-3",
  lg: "xl:col-span-2"
}

export function ContentLayout({
  children,
  sidebar,
  className,
  sidebarPosition = "right",
  sidebarSize = "md",
  gap = "md"
}: ContentLayoutProps) {
  const gridCols = sidebarSize ? sizeClasses[sidebarSize] : "grid-cols-1"
  const gapClass = gapClasses[gap]
  const mainSpan = sidebarSize ? mainSpanClasses[sidebarSize] : ""

  if (!sidebar) {
    return (
      <div className={`w-full ${className}`}>
        {children}
      </div>
    )
  }

  if (sidebarPosition === "left") {
    return (
      <div className={`grid grid-cols-1 ${gridCols} ${gapClass} ${className}`}>
        <div className="xl:col-span-1">
          {sidebar}
        </div>
        <div className={mainSpan}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols} ${gapClass} ${className}`}>
      <div className={mainSpan}>
        {children}
      </div>
      <div className="xl:col-span-1">
        {sidebar}
      </div>
    </div>
  )
}