"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { X, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function CartSidebar() {
  const {
    cart,
    itemCount,
    isOpen,
    loading,
    updateQuantity,
    removeItem,
    closeCart,
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
  const total = subtotal // Shipping is free/calculated elsewhere usually, keeping simple matching other page

  const isAllSelected = items.length > 0 && selectedItems.length === items.length

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCart} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Giỏ hàng</h2>
          <button onClick={closeCart} className="p-2 hover:bg-muted rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground mt-3">Đang tải giỏ hàng...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-muted-foreground">Giỏ hàng của bạn trống</p>
              <p className="text-sm text-muted-foreground mt-2">Thêm sách để bắt đầu mua sắm</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => selectAll(!!checked)}
                  id="sidebar-select-all"
                />
                <label htmlFor="sidebar-select-all" className="text-sm font-medium cursor-pointer select-none">
                  Chọn tất cả ({items.length})
                </label>
              </div>

              {items.map((item) => (
                <div key={item.itemId} className="flex gap-4 pb-4 border-b border-border">
                  {/* Ckeckbox */}
                  <div className="self-center">
                    <Checkbox
                      checked={selectedItems.includes(item.bookId)}
                      onCheckedChange={() => toggleItemSelection(item.bookId)}
                      aria-label={`Select ${item.bookTitle}`}
                    />
                  </div>

                  {/* Image */}
                  <div className="w-16 h-24 bg-muted rounded shrink-0 flex items-center justify-center">
                    <img
                      src={item.bookImageUrl || "/placeholder.svg"}
                      alt={item.bookTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.bookId}`}
                      className="font-semibold text-foreground hover:text-primary transition line-clamp-2"
                      onClick={closeCart}
                    >
                      {item.bookTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">
                      ISBN: {item.bookIsbn}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-primary">
                        {(item.bookDiscountPrice ?? item.bookPrice).toLocaleString("vi-VN")}₫
                      </p>
                      {item.bookDiscountPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {item.bookPrice.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-border rounded">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.bookId, item.quantity - 1)
                            } else {
                              removeItem(item.bookId)
                            }
                          }}
                          className="px-2 py-1 hover:bg-muted disabled:opacity-50"
                          disabled={loading}
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity < item.stockQuantity) {
                              updateQuantity(item.bookId, item.quantity + 1)
                            }
                          }}
                          className="px-2 py-1 hover:bg-muted disabled:opacity-50"
                          disabled={loading || item.quantity >= item.stockQuantity}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.bookId)}
                        className="p-1 hover:text-destructive transition ml-auto disabled:opacity-50"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Stock warning */}
                    {item.quantity >= item.stockQuantity && (
                      <p className="text-xs text-orange-500 mt-1">
                        Chỉ còn {item.stockQuantity} sản phẩm
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã chọn:</span>
                <span className="font-semibold">{selectedItems.length} sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-semibold">{total.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vận chuyển:</span>
                <span className="font-semibold">Miễn phí</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-bold">Tổng cộng:</span>
              <span className="font-bold text-lg text-primary">{total.toLocaleString("vi-VN")}₫</span>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || selectedItems.length === 0}
              onClick={() => {
                if (selectedItems.length === 0) return
                closeCart()
                if (!isAuthenticated) {
                  router.push("/login?redirect=/checkout")
                } else {
                  router.push("/checkout")
                }
              }}
            >
              Thanh toán ({selectedItems.length})
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={closeCart}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
