"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = 'force-dynamic'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RecommendationSection } from "@/components/recommendations/recommendation-section"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { authService } from "@/lib/services/auth.service"
import { usersService } from "@/lib/services/users.service"
import { booksService, Book, CategoryWithBooks } from "@/lib/services/books.service"
import { categoriesService, Category } from "@/lib/services/categories.service"
import { message } from "antd"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

// Component to handle search params callback (needs Suspense boundary)
function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUserState, user } = useAuth()
  const [hasProcessedCallback, setHasProcessedCallback] = useState(false)

  useEffect(() => {
    // Tránh xử lý callback nhiều lần
    if (hasProcessedCallback) {
      return
    }

    const token = searchParams.get("token")
    const refreshToken = searchParams.get("refreshToken")
    const error = searchParams.get("error")
    const userParam = searchParams.get("user")

    if (token) {
      // Lưu token do backend trả về sau khi đăng nhập Google (giống hệt login bằng username)
      localStorage.setItem("authToken", token)

      // Lưu refreshToken nếu có (giống hệt login bằng username)
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken)
      }

      let normalizedUser: any = null

      // Nếu backend truyền kèm thông tin user qua query param `user`, parse và lưu lại
      if (userParam) {
        try {
          // Decode URL-encoded JSON string
          const decodedUserParam = decodeURIComponent(userParam)
          const parsed = JSON.parse(decodedUserParam) as {
            id?: string
            email?: string
            fullName?: string
            username?: string
            phoneNumber?: string
            role?: string
            avatar?: string
            avatarUrl?: string // Google avatar URL
            emailVerified?: boolean
            isEmailVerified?: boolean // Backend có thể gửi field này
          }

          // Format user giống hệt như login bằng username (theo User interface)
          normalizedUser = {
            id: parsed.id ?? "",
            email: parsed.email ?? "",
            fullName: parsed.fullName ?? parsed.username ?? (parsed.email ? parsed.email.split("@")[0] : ""),
            role: (parsed.role ?? "CUSTOMER").toUpperCase(),
            username: parsed.username,
            phone: parsed.phoneNumber,
            avatar: parsed.avatarUrl ?? parsed.avatar,
            emailVerified: parsed.emailVerified ?? parsed.isEmailVerified ?? false,
            createdAt: new Date().toISOString(),
          }

          localStorage.setItem("user", JSON.stringify(normalizedUser))
        } catch (e) {
          // Failed to parse user info - will fetch from API instead
        }
      }

      // Nếu có user, cập nhật AuthContext ngay lập tức
      if (normalizedUser) {
        setUserState(normalizedUser)

        // Đánh dấu đã xử lý callback
        setHasProcessedCallback(true)

        // Chuyển về trang chủ và xóa token/error khỏi URL
        router.replace("/")
      } else {
        // Fallback: Nếu không có user param, gọi API để lấy user info
        const fetchUserInfo = async () => {
          try {
            // Sử dụng usersService.getMyProfile() thay vì authService.getCurrentUser()
            // vì API /users/me trả về đầy đủ thông tin bao gồm avatarUrl
            const userInfo = await usersService.getMyProfile()

            // Format user giống hệt như login bằng username
            // API trả về avatarUrl (từ Google) hoặc avatar (custom)
            const formattedUser = {
              id: userInfo.id ?? "",
              email: userInfo.email ?? "",
              fullName: userInfo.fullName ?? userInfo.username ?? (userInfo.email ? userInfo.email.split("@")[0] : ""),
              role: (userInfo.role ?? "CUSTOMER").toUpperCase(),
              username: userInfo.username,
              phone: userInfo.phoneNumber || undefined, // Convert null to undefined
              avatar: userInfo.avatarUrl || userInfo.avatar, // Lấy avatarUrl nếu có (từ Google)
              emailVerified: userInfo.emailVerified ?? false,
              createdAt: new Date().toISOString(),
            }

            localStorage.setItem("user", JSON.stringify(formattedUser))
            setUserState(formattedUser)

            // Đánh dấu đã xử lý callback
            setHasProcessedCallback(true)

            // Chuyển về trang chủ và xóa token/error khỏi URL
            router.replace("/")
          } catch (error: any) {
            // Fallback: Decode JWT token để lấy thông tin user
            try {
              const tokenParts = token.split(".")
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]))

                // Tạo user object từ JWT payload
                const decodedUser = {
                  id: payload.sub || payload.userId || "",
                  email: payload.email || payload.sub || "",
                  fullName: payload.fullName || payload.name || payload.sub || "",
                  role: (payload.scope || "CUSTOMER").toUpperCase(),
                  username: payload.sub || "",
                  phone: payload.phoneNumber || "",
                  avatar: payload.avatar || "",
                  emailVerified: payload.emailVerified || false,
                  createdAt: new Date().toISOString(),
                }

                localStorage.setItem("user", JSON.stringify(decodedUser))
                setUserState(decodedUser)
                setHasProcessedCallback(true)
                router.replace("/")
                return
              }
            } catch (decodeError) {
              // Ignore decode errors
            }

            // Fallback cuối cùng: Thử load từ localStorage (nếu đã có từ trước)
            const storedUser = localStorage.getItem("user")
            if (storedUser) {
              try {
                const parsed = JSON.parse(storedUser)
                setUserState(parsed)
                setHasProcessedCallback(true)
                router.replace("/")
              } catch (e) {
                setHasProcessedCallback(true)
                router.replace("/")
              }
            } else {
              setHasProcessedCallback(true)
              router.replace("/")
            }
          }
        }

        fetchUserInfo()
      }
    } else if (error) {
      // Kiểm tra xem có token trong localStorage từ lần login trước không
      // Nếu có và user đã đăng nhập, có thể backend đã login thành công nhưng redirect sai
      const existingToken = localStorage.getItem("authToken")
      const existingUser = localStorage.getItem("user")

      if (existingToken && existingUser && user) {
        // Không hiển thị lỗi nếu đã có token và user
        setHasProcessedCallback(true)
        router.replace("/")
        return
      }

      // Hiển thị thông báo lỗi cho người dùng
      let errorMessage = "Đăng nhập Google thất bại. Vui lòng thử lại."

      if (error === "google_login_failed") {
        errorMessage = "Không thể đăng nhập bằng Google. Backend đã xử lý nhưng không trả về token. Vui lòng kiểm tra backend hoặc đăng nhập bằng tên đăng nhập/mật khẩu."
      } else if (error === "google_invalid_code") {
        errorMessage = "Mã xác thực không hợp lệ. Vui lòng thử lại."
      }

      // Đánh dấu đã xử lý callback trước khi hiển thị message
      setHasProcessedCallback(true)

      // Hiển thị message với duration dài hơn để user có thể đọc
      // Sử dụng setTimeout để đảm bảo state đã được cập nhật
      setTimeout(() => {
        message.error({
          content: errorMessage,
          duration: 6,
        })
      }, 0)

      // Delay một chút trước khi redirect để đảm bảo message được hiển thị
      setTimeout(() => {
        // Chuyển về trang chủ và xóa error khỏi URL
        router.replace("/")
      }, 200)
    }
  }, [router, searchParams, setUserState, hasProcessedCallback, user])

  return null
}

// Main content component
function HomeContent() {
  const [bestSellingBooks, setBestSellingBooks] = useState<Book[]>([])
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([])
  const [popularCategoriesWithBooks, setPopularCategoriesWithBooks] = useState<CategoryWithBooks[]>([])
  const [literatureBooks, setLiteratureBooks] = useState<Book[]>([])
  
  // Embla Carousel for hero section
  const [emblaRef] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [bestSellers, suggested, categoriesWithBooks, literatureResponse] = await Promise.all([
          booksService.getBestSellers(4),
          booksService.getSuggestedBooks(4),
          booksService.getBooksByPopularCategories(3),
          booksService.getBooks({ size: 4 })
        ])
        setBestSellingBooks(bestSellers)
        setSuggestedBooks(suggested)
        setPopularCategoriesWithBooks(categoriesWithBooks)
        setLiteratureBooks(literatureResponse.content)
      } catch (error) {
        console.error("Failed to fetch books:", error)
      }
    }
    fetchBooks()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-br from-secondary to-background py-16 sm:py-20 md:py-32">
          <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-2">
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  Khám phá thế giới sách đầy màu sắc
                </h1>
                <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
                  Tìm kiếm những cuốn sách yêu thích của bạn từ hàng triệu đầu sách được chọn lọc cẩn thận.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/products">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 sm:w-auto">
                      Mua sắm ngay
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Khám phá thêm
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="order-first flex justify-center lg:order-last">
                <div className="flex aspect-square max-w-xs items-center justify-center rounded-2xl overflow-hidden bg-muted sm:max-w-sm lg:max-w-md shadow-lg">
                  {bestSellingBooks.length > 0 ? (
                    <div className="w-full h-full" ref={emblaRef}>
                      <div className="flex h-full">
                        {bestSellingBooks.slice(0, 4).map((book) => (
                          <Link 
                            key={book.id} 
                            href={`/products/${book.id}`}
                            className="flex-[0_0_100%] min-w-0 relative group cursor-pointer"
                          >
                            <img
                              src={book.mainImageUrl || book.imageUrls?.[0] || "/placeholder.svg"}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 group-hover:from-black/90 transition-colors">
                              <p className="text-white font-semibold text-sm line-clamp-2">{book.title}</p>
                              <p className="text-white/80 text-xs mt-1">{book.authorNames?.[0]}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-white font-bold text-sm">{book.discountPrice.toLocaleString("vi-VN")}₫</span>
                                {book.price && book.discountPrice < book.price && (
                                  <span className="text-white/60 text-xs line-through">{book.price.toLocaleString("vi-VN")}₫</span>
                                )}
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-5xl sm:text-6xl">📚</span>
                      <p className="mt-4 text-sm text-muted-foreground sm:text-base">Khám phá sản phẩm nổi bật</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Section */}
        <section className="py-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-white shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Khuyến mãi đặc biệt!
                  </h2>
                  <p className="text-lg mb-6 text-white/90">
                    Giảm giá lên đến 50% cho tất cả các đầu sách mới
                  </p>
                  <Link href="/products">
                    <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                      Mua ngay
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl"></div>
                    <span className="relative text-8xl">🎁</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RecommendationSection
            title="Sách bán chạy nhất"
            description="Những cuốn sách được yêu thích nhất hiện tại"
            type="trending"
            limit={4}
            books={bestSellingBooks}
          />

          <RecommendationSection
            title="Gợi ý cho bạn"
            description="Những sách được đánh giá cao nhất"
            type="recommendations"
            limit={4}
            books={suggestedBooks}
          />

          <RecommendationSection
            title="Khám phá"
            description="Khám phá những tác phẩm hay nhất"
            type="category"
            categoryFilter="Văn học"
            limit={4}
            books={literatureBooks}
          />
        </div>

        {/* Featured Categories */}
        <section className="py-14 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center md:mb-12">
              <h2 className="mb-3 text-3xl font-bold text-foreground md:mb-4 md:text-4xl">Danh mục phổ biến</h2>
              <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
                Duyệt qua các danh mục sách được yêu thích nhất của chúng tôi
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {popularCategoriesWithBooks.length > 0 && (
                popularCategoriesWithBooks.slice(0, 3).map((item) => (
                  <Link key={item.category.id} href={`/categories/${item.category.id}`}>
                    <div className="group cursor-pointer">
                      <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-muted transition group-hover:shadow-lg">
                        <div className="flex h-full w-full items-center justify-center transition group-hover:bg-secondary">
                          {(() => {
                            const bookImage = item.books && item.books.length > 0
                              ? (item.books[0].mainImageUrl || (item.books[0].imageUrls && item.books[0].imageUrls[0]))
                              : null;

                            if (bookImage) {
                              return <img src={bookImage} alt={item.category.name} className="h-full w-full object-cover" />;
                            }

                            if (item.category.image) {
                              return <img src={item.category.image} alt={item.category.name} className="h-full w-full object-cover" />;
                            }

                            return <span className="text-4xl sm:text-5xl">📖</span>;
                          })()}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">
                        {item.category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground sm:text-base">
                        {item.category.description || `Khám phá ${item.category.name}`}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// Main page component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <AuthCallbackHandler />
      <HomeContent />
    </Suspense>
  )
}
