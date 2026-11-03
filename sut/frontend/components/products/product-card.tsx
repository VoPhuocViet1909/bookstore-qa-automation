"use client";

import type { Book } from "@/lib/services/books.service";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  book: Book;
}

export function ProductCard({ book }: ProductCardProps) {
  const { addToCart, loading: cartLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Log invalid data but still render with fallbacks
  if (!book || !book.id || !book.title) {
    console.warn("Invalid book data, using fallbacks:", book);
  }

  const bookId = book?.id || `unknown-${Date.now()}`;
  const price = book?.price || 0;
  const discountPrice = book?.discountPrice || price;

  const discount =
    discountPrice < price
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;
  // Check stock: stockQuantity must be a number > 0
  const inStock = (book?.stockQuantity ?? 0) > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(bookId, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/products/${bookId}`}>
      <div className="group cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-4">
          <img
            src={
              book?.mainImageUrl || book?.imageUrls?.[0] || "/placeholder.svg"
            }
            alt={book?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
              -{discount}%
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold">Hết hàng</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition line-clamp-2 mb-2">
            {book?.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {book?.authorNames?.[0] || "Unknown Author"}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(book?.averageRating || 0)
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

          {/* Price */}
          <div className="mt-auto mb-3 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-primary">
                {discountPrice.toLocaleString("vi-VN")}₫
              </span>
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {price.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!inStock || isAdding || cartLoading}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang thêm...
              </>
            ) : inStock ? (
              "Thêm vào giỏ"
            ) : (
              "Hết hàng"
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
