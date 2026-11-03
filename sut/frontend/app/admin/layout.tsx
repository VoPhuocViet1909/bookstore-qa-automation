"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { Menu, X } from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/login")
      return
    }

    if (typeof user.role === "string" && user.role.toUpperCase() !== "ADMIN") {
      router.replace("/")
    }
  }, [isLoading, router, user])

  if (isLoading || !user || (typeof user.role === "string" && user.role.toUpperCase() !== "ADMIN")) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleMobileLogout = () => {
    setIsSidebarOpen(false)
    handleLogout()
  }

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:flex">
        <AdminSidebar onLogout={handleLogout} className="lg:min-h-screen" />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition hover:bg-card/80"
              aria-label="Mở menu quản trị"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/admin" className="text-sm font-semibold text-foreground">
              Bảng điều khiển
            </Link>
          </div>
          <button
            type="button"
            onClick={handleMobileLogout}
            className="text-sm font-medium text-primary transition hover:text-primary/80"
          >
            Đăng xuất
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={closeSidebar} aria-hidden />
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] lg:hidden">
            <div className="relative h-full">
              <AdminSidebar
                onLogout={handleMobileLogout}
                onNavigate={closeSidebar}
                className="min-h-full shadow-xl"
              />
              <button
                type="button"
                onClick={closeSidebar}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary/30 text-primary-foreground transition hover:bg-primary/40"
                aria-label="Đóng menu quản trị"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
