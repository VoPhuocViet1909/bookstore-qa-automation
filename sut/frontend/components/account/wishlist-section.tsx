"use client"

import { useEffect, useState } from "react"
import { wishlistService, WishlistBook } from "@/lib/services/wishlist.service"
import { Heart, Trash2, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 6

export function WishlistSection() {
  const [wishlistBooks, setWishlistBooks] = useState<WishlistBook[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const wishlist = await wishlistService.getWishlist()
      setWishlistBooks(wishlist.books || [])
    } catch (error) {
      console.error("Error loading wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (bookId: string) => {
    try {
      setRemovingId(bookId)
      await wishlistService.removeFromWishlist(bookId)
      // Remove from local state
      setWishlistBooks(prev => prev.filter(book => book.id !== bookId))
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      alert("Có lỗi xảy ra khi xóa sản phẩm")
    } finally {
      setRemovingId(null)
    }
  }

  const handleAddToCart = (bookId: string) => {
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", bookId)
    alert("Tính năng thêm vào giỏ hàng đang được phát triển")
  }

  // Pagination
  const totalPages = Math.ceil(wishlistBooks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentBooks = wishlistBooks.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Danh sách yêu thích
        </h2>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (wishlistBooks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Danh sách yêu thích
        </h2>
        <div className="text-center py-12">
          <Heart
            size={48}
            className="mx-auto text-muted-foreground mb-4 opacity-50"
          />
          <p className="text-muted-foreground mb-4">
            Danh sách yêu thích trống
          </p>
          <Link href="/products">
            <Button>Khám phá sách hay</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Danh sách yêu thích
        </h2>
        <span className="text-sm text-muted-foreground">
          {wishlistBooks.length} sản phẩm
        </span>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {currentBooks.map((book) => (
          <div
            key={book.id}
            className="border border-border rounded-lg p-4 hover:shadow-md transition group"
          >
            {/* Book Image */}
            <Link href={`/products/${book.id}`} className="block mb-3">
              <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden">
                <img
                  src={book.mainImageUrl || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
            </Link>

            {/* Book Info */}
            <div className="space-y-2">
              <Link href={`/products/${book.id}`}>
                <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition">
                  {book.title}
                </h3>
              </Link>

              {book.authorNames && book.authorNames.length > 0 && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {book.authorNames.join(", ")}
                </p>
              )}

              {/* Rating */}
              {book.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(book.averageRating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({book.reviewCount || 0})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  {book.price.toLocaleString("vi-VN")}₫
                </span>
                {book.discountPrice && book.discountPrice !== book.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {book.discountPrice.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <p className={`text-sm ${book.stockQuantity > 0 ? "text-accent" : "text-destructive"}`}>
                {book.stockQuantity > 0 ? "✓ Còn hàng" : "✗ Hết hàng"}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(book.id)}
                  disabled={book.stockQuantity <= 0}
                >
                  <ShoppingCart size={16} className="mr-1" />
                  Thêm vào giỏ
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemove(book.id)}
                  disabled={removingId === book.id}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </Button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 py-1 text-muted-foreground">
                    ...
                  </span>
                )
              }
              return null
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Đang hiển thị {startIndex + 1} - {Math.min(endIndex, wishlistBooks.length)} trong tổng số {wishlistBooks.length} sản phẩm
        </p>
      </div>
    </div>
  )
}
