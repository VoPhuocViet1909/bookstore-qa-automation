"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { mockBooks } from "@/lib/mock-data"
import { Star, Heart, Share2, Truck, MapPin, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Book, booksService, Review, reviewsService, wishlistService, addressService, shipmentService, promotionsService } from "@/lib/services"
import type { Address } from "@/lib/services/address.service"
import type { CalculateShippingResponse } from "@/lib/services/shipment.service"
import type { Promotion } from "@/lib/services/promotions.service"
import { AddressSelectModal } from "@/components/products/address-select-modal"
import { ProductCard } from "@/components/products/product-card"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

export default function ProductDetailPage() {
  const params = useParams<{ id: string | string[] }>()
  const productIdValue = Array.isArray(params?.id) ? params?.id[0] : params?.id
  const productId = productIdValue?.toString().trim()
  const router = useRouter()
  const { addToCart, loading: cartLoading } = useCart()

  const [book, setBook] = useState<Book | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userAddress, setUserAddress] = useState<Address | null>(null)
  const [allAddresses, setAllAddresses] = useState<Address[]>([])
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<CalculateShippingResponse | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([])
  const [showAllPromotions, setShowAllPromotions] = useState(false)
  const [bestSellers, setBestSellers] = useState<Book[]>([])
  const [bestSellersLoading, setBestSellersLoading] = useState(false)
  
  // Embla Carousel for best sellers
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: true,
    },
    [Autoplay({ delay: 2000, stopOnInteraction: false })]
  )

  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    setIsLoggedIn(!!token)

    if (productId) {
      booksService.getBookById(productId).then(setBook)

      // Load reviews
      setReviewsLoading(true)
      reviewsService.getBookReviews(productId, { page: 0, pageSize: 5 })
        .then(response => {
          setReviews(response.content || [])
        })
        .catch(error => {
          console.error("Error loading reviews:", error)
        })
        .finally(() => {
          setReviewsLoading(false)
        })

      // Load active promotions
      promotionsService.getActivePromotions()
        .then(promotions => {
          setActivePromotions(promotions)
        })
        .catch(error => {
          console.error("Error loading promotions:", error)
        })

      // Load best sellers
      setBestSellersLoading(true)
      booksService.getBestSellers(8)
        .then(books => {
          setBestSellers(books)
        })
        .catch(error => {
          console.error("Error loading best sellers:", error)
        })
        .finally(() => {
          setBestSellersLoading(false)
        })

      // Check wishlist status only if user is logged in
      if (token) {
        wishlistService.checkWishlist(productId)
          .then(inWishlist => {
            setIsInWishlist(inWishlist)
          })
          .catch(error => {
            console.error("Error checking wishlist:", error)
          })

        // Load user address
        addressService.getUserAddresses()
          .then(addresses => {
            setAllAddresses(addresses)
            if (addresses && addresses.length > 0) {
              setUserAddress(addresses[0])
            }
          })
          .catch(error => {
            console.error("Error loading address:", error)
          })
      }
    }
  }, [productId])

  const handleShare = async () => {
    const shareData = {
      title: book?.title || "Sách hay",
      text: `${book?.title} - ${book?.authorNames?.join(", ")}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Đã sao chép link vào clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const truncateDescription = (text: string | undefined, maxLength: number = 50) => {
    if (!text) return ""
    const words = text.split(" ")
    if (words.length <= maxLength) return text
    return words.slice(0, maxLength).join(" ") + "..."
  }

  const getEstimatedDeliveryDate = () => {
    const today = new Date()
    const minDays = 2
    const maxDays = 3

    const minDate = new Date(today)
    minDate.setDate(today.getDate() + minDays)

    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + maxDays)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        weekday: "short"
      })
    }

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`
  }

  const calculateShipping = async (address: Address) => {
    try {
      setShippingLoading(true)
      const response = await shipmentService.calculateShippingFee(
        address.districtId,
        address.wardCode
      )
      setShippingInfo(response)
    } catch (error) {
      console.error("Error calculating shipping:", error)
      setShippingInfo(null)
    } finally {
      setShippingLoading(false)
    }
  }

  // Calculate shipping when address changes
  useEffect(() => {
    if (userAddress) {
      calculateShipping(userAddress)
    } else {
      setShippingInfo(null)
    }
  }, [userAddress])

  const formatDeliveryDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      weekday: "short"
    })
  }

  const handleAddressSelect = (address: Address) => {
    setUserAddress(address)
  }

  const handleAddressCreated = () => {
    // Reload addresses after creating new one
    addressService.getUserAddresses()
      .then(addresses => {
        setAllAddresses(addresses)
      })
      .catch(error => {
        console.error("Error reloading addresses:", error)
      })
  }

  const handleWishlistToggle = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    if (!productId) {
      return
    }

    try {
      setWishlistLoading(true)
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(productId)
        setIsInWishlist(false)
      } else {
        await wishlistService.addToWishlist(productId)
        setIsInWishlist(true)
      }
    } catch (error: any) {
      alert("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setWishlistLoading(false)
    }
  }

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground text-lg">Đang tải thông tin sách...</p>
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
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-2/3 items-center justify-center overflow-hidden rounded-lg bg-muted">
                <img
                  src={book.imageUrls?.[selectedImageIndex] || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {book.imageUrls?.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/20"
                        }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${book.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {book.categoryNames}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{book.title}</h1>

              <p className="text-lg text-muted-foreground mb-4">Tác giả: {book.authorNames}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(book.averageRating ?? 0) ? "fill-yellow-500 text-yellow-500" : "text-muted"}
                    />
                  ))}
                </div>
                <span className="text-foreground font-medium">{book.averageRating}</span>
                <span className="text-muted-foreground">({book.reviewCount || 0} đánh giá)</span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">{truncateDescription(book.description, 50)}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">{book.discountPrice.toLocaleString("vi-VN")}₫</span>
                  {book.price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {book.price.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>
                {book.price && book.discountPrice < book.price && (
                  <p className="text-accent font-semibold mt-2">
                    Tiết kiệm {Math.round(((book.price - book.discountPrice) / book.price) * 100)}%
                  </p>
                )}
              </div>

              {/* Promotion Section */}
              {activePromotions.length > 0 && (
                <div className="mb-6 p-4 rounded-lg border border-accent/30 bg-accent/5">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">Khuyến mãi đặc biệt</h3>
                      <div className="space-y-2">
                        {(showAllPromotions ? activePromotions : activePromotions.slice(0, 2)).map((promo) => (
                          <div key={promo.id} className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {promo.name} - Giảm {promo.discount}%
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Sử dụng mã: <span className="font-mono font-semibold text-accent">{promo.code}</span>
                              </p>
                              {promo.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {promo.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Từ {new Date(promo.startDate).toLocaleDateString("vi-VN")} đến {new Date(promo.endDate).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {activePromotions.length > 2 && (
                        <button
                          onClick={() => setShowAllPromotions(!showAllPromotions)}
                          className="text-xs text-primary hover:underline mt-3 font-medium"
                        >
                          {showAllPromotions ? "Thu gọn" : `Xem thêm ${activePromotions.length - 2} khuyến mãi`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                <p className={(book.stockQuantity ?? 0) > 0 ? "text-accent" : "text-destructive"}>
                  {(book.stockQuantity ?? 0) > 0 ? "✓ Còn hàng" : "✗ Hết hàng"}
                </p>
              </div>

              {/* Quantity & Actions */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex w-full items-center justify-between rounded-lg border border-border sm:w-auto">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-l-lg transition hover:bg-muted"
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="flex h-10 flex-1 items-center justify-center border-x border-border text-sm font-semibold sm:w-16 sm:flex-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-r-lg transition hover:bg-muted"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 sm:flex-1"
                    disabled={!((book.stockQuantity ?? 0) > 0) || cartLoading}
                    onClick={() => book.id && addToCart(book.id, quantity)}
                  >
                    {cartLoading ? "Đang xử lý..." : (book.stockQuantity ?? 0) > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                  </Button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-3 transition hover:bg-muted ${isInWishlist ? "bg-muted text-primary" : ""
                      }`}
                  >
                    <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
                    {wishlistLoading ? "Đang xử lý..." : (isInWishlist ? "Đã lưu" : "Lưu sách")}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 transition hover:bg-muted sm:flex-none"
                  >
                    <Share2 size={18} />
                    Chia sẻ
                  </button>
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <span className="text-muted-foreground">Nhà xuất bản:</span>
                  <span className="text-foreground">NXB Thời đại</span>
                </div>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <span className="text-muted-foreground">Năm xuất bản:</span>
                  <span className="text-foreground">2024</span>
                </div>
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <span className="text-muted-foreground">Loại bìa:</span>
                  <span className="text-foreground">Bìa mềm</span>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mt-6 space-y-3 border border-border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Truck size={18} className="text-primary" />
                  Thông tin giao hàng
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-1">Giao hàng đến:</p>
                      {userAddress ? (
                        <>
                          <p className="text-foreground font-medium">
                            {userAddress.street}, {userAddress.ward}
                          </p>
                          <p className="text-foreground font-medium">
                            {userAddress.district}, {userAddress.province}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {userAddress.recipientName} - {userAddress.phoneNumber}
                          </p>
                        </>
                      ) : (
                        <p className="text-foreground font-medium">TP. Hồ Chí Minh</p>
                      )}
                      <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="text-primary text-xs hover:underline mt-1"
                      >
                        Thay đổi địa chỉ
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-1">Thời gian giao hàng dự kiến:</p>
                      {shippingLoading ? (
                        <p className="text-sm text-muted-foreground">Đang tính toán...</p>
                      ) : shippingInfo ? (
                        <>
                          <p className="text-foreground font-medium">
                            {formatDeliveryDate(shippingInfo.estimatedDeliveryTime)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ({shippingInfo.deliveryDays} ngày làm việc)
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-foreground font-medium">
                            {getEstimatedDeliveryDate()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            (2-3 ngày làm việc)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-1">Phí giao hàng:</p>
                      {shippingLoading ? (
                        <p className="text-sm text-muted-foreground">Đang tính toán...</p>
                      ) : shippingInfo ? (
                        <div className="space-y-1">
                          {shippingInfo.totalFee === 0 ? (
                            <p className="text-accent font-semibold">Miễn phí giao hàng</p>
                          ) : (
                            <>
                              <p className="text-foreground font-semibold">
                                {shippingInfo.totalFee.toLocaleString("vi-VN")}₫
                              </p>
                              {shippingInfo.serviceFee > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Phí dịch vụ: {shippingInfo.serviceFee.toLocaleString("vi-VN")}₫
                                </p>
                              )}
                              {shippingInfo.insuranceFee > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Phí bảo hiểm: {shippingInfo.insuranceFee.toLocaleString("vi-VN")}₫
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-accent font-semibold">Miễn phí giao hàng</p>
                          <p className="text-xs text-muted-foreground">
                            Cho đơn hàng từ 150.000₫
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Đảm bảo hoàn tiền 100% nếu hàng không đúng mô tả</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="mt-16 max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Mô tả chi tiết</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Đánh giá sản phẩm</h2>

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Đang tải đánh giá...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.reviewID} className="border-b border-border pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <div className="shrink-0">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-lg">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">{review.userName}</h4>
                          {review.isVerifiedPurchase && (
                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                              Đã mua hàng
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        {/* Comment */}
                        <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Best Sellers Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Sách bán chạy</h2>
            
            {bestSellersLoading ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : bestSellers.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Không có sách bán chạy</p>
              </div>
            ) : (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-4">
                  {bestSellers.map((book) => (
                    <div key={book.id} className="flex-[0_0_180px] sm:flex-[0_0_220px] min-w-0">
                      <ProductCard book={book} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Address Select Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={allAddresses}
        selectedAddressId={userAddress?.id}
        onSelectAddress={handleAddressSelect}
        onAddressCreated={handleAddressCreated}
      />
    </div>
  )
}
