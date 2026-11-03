"use client"

import Link from "next/link"
import { LayoutDashboard, BookOpen, ShoppingCart, Users, Settings, LogOut, BarChart3, Newspaper, Tag } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image";

interface AdminSidebarProps {
  onLogout: () => void
  onNavigate?: () => void
  className?: string
}

export function AdminSidebar({ onLogout, onNavigate, className }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Quản lý sản phẩm", href: "/admin/books", icon: BookOpen },
    { label: "Quản lý đơn hàng", href: "/admin/orders", icon: ShoppingCart },
    { label: "Quản lý khuyến mãi", href: "/admin/promotions", icon: Tag },
    { label: "Thống kê doanh thu", href: "/admin/revenue", icon: BarChart3 },
    { label: "Quản lý người dùng", href: "/admin/users", icon: Users },
    { label: "Quản lý tin tức", href: "/admin/news", icon: Newspaper },
    { label: "Cài đặt", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className={cn("flex w-64 min-h-full flex-col bg-primary text-primary-foreground", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-primary-foreground/20">



        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2">
          <Image
            src="/logo_not_found.png"
            alt="Not Found Bookstore"
            width={48}
            height={48}
            priority
            className="h-12 w-12 object-contain"
          />
          <span className="font-bold text-lg">Quản lý</span>
        </Link>

      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition",
              pathname === item.href ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/10",
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-primary-foreground/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-foreground/10 transition"
        >
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
