"use client"

import { useCart } from "@/lib/cart-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Trash2, Plus, Minus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    loading,
    selectedItems,
    toggleItemSelection,
    selectAll
  } = useCart()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const items = cart?.items || []

  // Calculate total based on selected items
  const selectedCartItems = items.filter(item => selectedItems.includes(item.bookId))
  const subtotal = selectedCartItems.reduce((sum, item) => sum + ((item.bookDiscountPrice ?? item.bookPrice) * item.quantity), 0)
  const shipping = 0
  const total = subtotal + shipping

  const isAllSelected = items.length > 0 && selectedItems.length === items.length

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <span className="text-6xl block">🛒</span>
            <h1 className="text-2xl font-bold text-foreground">Giỏ hàng trống</h1>
            <p className="text-muted-foreground">Hãy thêm sách vào giỏ hàng của bạn</p>
            <Link href="/products">
              <Button className="mt-4">Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Giỏ hàng của bạn</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">

              {/* Select All Header */}
              <div className="flex items-center gap-2 mb-4 p-4 border border-border rounded-lg bg-card">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => selectAll(!!checked)}
                  id="select-all"
                />
                <label htmlFor="select-all" className="font-medium cursor-pointer select-none">
                  Chọn tất cả ({items.length} sản phẩm)
                </label>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.bookId}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition hover:shadow-md sm:flex-row items-start"
                  >
                    {/* Checkbox */}
                    <div className="pt-2 sm:pt-0 sm:self-center">
                      <Checkbox
                        checked={selectedItems.includes(item.bookId)}
                        onCheckedChange={() => toggleItemSelection(item.bookId)}
                        aria-label={`Select ${item.bookTitle}`}
                      />
                    </div>

                    {/* Image */}
                    <div className="flex h-40 w-full shrink-0 items-center justify-center rounded bg-muted sm:h-32 sm:w-24">
                      <img
                        src={item.bookImageUrl || "/placeholder.svg"}
                        alt={item.bookTitle}
                        className="h-full w-full rounded object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col gap-4">
                      <Link
                        href={`/products/${item.bookId}`}
                        className="font-semibold text-foreground hover:text-primary transition"
                      >
                        {item.bookTitle}
                      </Link>
                      {/* Author is not in CartItemResponse, skipping */}

                      {/* Price & Quantity */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                          <div className="flex items-center overflow-hidden rounded-lg border border-border">
                            <button
                              onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                              disabled={loading || item.quantity <= 1}
                              className="flex h-10 w-10 items-center justify-center transition hover:bg-muted disabled:opacity-50"
                              aria-label="Giảm số lượng"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                              disabled={loading}
                              className="flex h-10 w-10 items-center justify-center transition hover:bg-muted disabled:opacity-50"
                              aria-label="Tăng số lượng"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-primary">
                              {((item.bookDiscountPrice ?? item.bookPrice) * item.quantity).toLocaleString("vi-VN")}₫
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(item.bookDiscountPrice ?? item.bookPrice).toLocaleString("vi-VN")}₫ x {item.quantity}
                            </p>
                            {item.bookDiscountPrice && (
                              <p className="text-xs text-muted-foreground line-through">
                                {item.bookPrice.toLocaleString("vi-VN")}₫
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.bookId)}
                          disabled={loading}
                          className="self-start rounded-lg p-2 transition hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 disabled:opacity-50"
                          aria-label="Xóa khỏi giỏ"
                        >
                          {loading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-6 bg-transparent"
                onClick={() => clearCart()}
                disabled={loading}
              >
                Xóa tất cả
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-border bg-muted/50 p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">Tóm tắt đơn hàng</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Đã chọn:</span>
                    <span className="font-medium">{selectedItems.length} sản phẩm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vận chuyển:</span>
                    <span className="font-medium text-accent">Miễn phí</span>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-bold">Tổng cộng:</span>
                  <span className="text-lg font-bold text-primary">{total.toLocaleString("vi-VN")}₫</span>
                </div>

                <Button
                  className="mb-2 w-full bg-primary hover:bg-primary/90"
                  disabled={loading || selectedItems.length === 0}
                  onClick={() => {
                    if (selectedItems.length === 0) return
                    if (!isAuthenticated) {
                      router.push("/login?redirect=/checkout")
                    } else {
                      router.push("/checkout")
                    }
                  }}
                >
                  Thanh toán ({selectedItems.length})
                </Button>
                <Link href="/products">
                  <Button variant="outline" className="w-full bg-transparent">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
