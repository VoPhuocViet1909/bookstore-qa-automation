"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { SearchModal } from "@/components/search/search-modal";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, toggleCart } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo_not_found.png"
                alt="Not Found Bookstore"
                width={48}
                height={48}
                priority
                className="h-12 w-12 object-contain"
              />
              <span className="hidden text-lg font-semibold text-foreground sm:inline md:text-xl">
                Nhà Sách Online
              </span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/products"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/products") ? "text-primary font-bold" : "text-foreground"
                )}
              >
                Cửa hàng
              </Link>
              <Link
                href="/categories"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/categories") ? "text-primary font-bold" : "text-foreground"
                )}
              >
                Danh mục
              </Link>
              <Link
                href="/news"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/news") ? "text-primary font-bold" : "text-foreground"
                )}
              >
                Tin tức
              </Link>
              <Link
                href="/about"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive("/about") ? "text-primary font-bold" : "text-foreground"
                )}
              >
                Về chúng tôi
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-lg p-2 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Tìm kiếm"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={toggleCart}
                className="relative rounded-lg p-2 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Mở giỏ hàng"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User dropdown or login button */}
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {user.avatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                      <Image
                        src={user.avatar}
                        alt={user.fullName || "Avatar"}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {(user.fullName?.charAt(0) || user.email?.charAt(0) || "?").toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium sm:inline">
                    {user.fullName}
                  </span>
                </Link>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden bg-transparent sm:inline-flex"
                  >
                    Đăng nhập
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                className="rounded-lg p-2 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Mở menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="flex flex-col gap-2 pb-4 md:hidden">
              <Link
                href="/products"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  isActive("/products") ? "bg-muted text-primary font-bold" : "text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Cửa hàng
              </Link>
              <Link
                href="/categories"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  isActive("/categories") ? "bg-muted text-primary font-bold" : "text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Danh mục
              </Link>
              <Link
                href="/news"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  isActive("/news") ? "bg-muted text-primary font-bold" : "text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Tin tức
              </Link>
              <Link
                href="/about"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  isActive("/about") ? "bg-muted text-primary font-bold" : "text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                Về chúng tôi
              </Link>
              {user ? (
                <Link
                  href="/account"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tài khoản
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">Đăng nhập</Button>
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
