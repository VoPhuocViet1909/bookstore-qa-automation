/**
 * News List Page - Trang tin tức cho người dùng
 * Cho phép tất cả người dùng (guest, customer, admin) xem tin tức
 * Hỗ trợ tìm kiếm, lọc theo danh mục, tags, sắp xếp
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Calendar,
  Eye,
  Clock,
  Tag,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Interface cho News
interface NewsItem {
  newsID: string
  id?: string
  title: string
  content: string
  summary?: string
  category: string
  tags: string[]
  views: number
  featured: boolean
  status: string
  createdAt: string
  publishedAt: string
  authorName: string
  images: Array<{
    id: string
    url: string
    priority: number
  }>
}

interface NewsPageResponse {
  content: NewsItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// Popular tags để gợi ý
const POPULAR_TAGS = [
  "Sách mới",
  "Khuyến mãi",
  "Review sách",
  "Tác giả",
  "Văn học",
  "Kinh tế",
  "Kỹ năng sống",
  "Thiếu nhi",
]

// Categories cho filter - Đồng bộ với admin
const CATEGORIES = [
  { value: "ALL", label: "Tất cả danh mục" },
  { value: "Sách mới", label: "Sách mới" },
  { value: "Tác giả", label: "Tác giả" },
  { value: "Sự kiện", label: "Sự kiện" },
  { value: "Khuyến mãi", label: "Khuyến mãi" },
  { value: "Review", label: "Review" },
  { value: "Hướng dẫn", label: "Hướng dẫn" },
  { value: "Tin tức", label: "Tin tức" },
]

// Sort field options - Đồng bộ với admin
const SORT_FIELDS = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "views", label: "Lượt xem" },
  { value: "title", label: "Tiêu đề" },
  { value: "category", label: "Danh mục" },
]

// Sort order options
const SORT_ORDERS = [
  { value: "desc", label: "Giảm dần" },
  { value: "asc", label: "Tăng dần" },
]

// Legacy sort options for backward compatibility
const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Mới nhất" },
  { value: "createdAt-asc", label: "Cũ nhất" },
  { value: "views-desc", label: "Xem nhiều nhất" },
  { value: "title-asc", label: "Tiêu đề A-Z" },
  { value: "title-desc", label: "Tiêu đề Z-A" },
]

// Extract first image from HTML content - skip invalid URLs
function extractFirstImage(content: string): string | null {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    const url = match[1]
    // Skip via.placeholder.com URLs as they're unreliable
    if (url && !url.includes('via.placeholder.com')) {
      return url
    }
  }
  return null
}

// Validate and get safe image URL
function getSafeImageUrl(news: NewsItem, placeholder: string): string {
  // First try images array
  if (news.images && news.images.length > 0) {
    const imgUrl = news.images[0]?.url
    if (imgUrl && !imgUrl.includes('via.placeholder.com')) {
      return imgUrl
    }
  }
  // Then try extracting from content
  const contentImg = extractFirstImage(news.content || '')
  if (contentImg) {
    return contentImg
  }
  // Fallback to placeholder
  return placeholder
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Format views
function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

// Calculate read time (words per minute)
function calculateReadTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "")
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

// Placeholder image for news without cover - using placehold.co (more reliable)
const PLACEHOLDER_IMAGE = "https://placehold.co/800x400/e2e8f0/64748b?text=Tin+tuc"

// News Card Component - All cards same size
function NewsCard({ news }: { news: NewsItem }) {
  const imageUrl = getSafeImageUrl(news, PLACEHOLDER_IMAGE)
  const readTime = calculateReadTime(news.content || '')

  return (
    <Link
      href={`/news/${news.newsID || news.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/30"
    >
      <div className="relative overflow-hidden h-48">
        <Image
          src={imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = PLACEHOLDER_IMAGE
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary">
            {news.category}
          </Badge>
        </div>

        {/* Featured badge */}
        {news.featured && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-yellow-500/90 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Nổi bật
            </Badge>
          </div>
        )}

        {/* Views on image */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/90 text-xs bg-black/40 px-2 py-1 rounded-full">
          <Eye className="h-3 w-3" />
          {formatViews(news.views)}
        </div>
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 text-base">
          {news.title}
        </h3>

        {/* Summary */}
        {news.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {news.summary}
          </p>
        )}

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {news.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {news.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{news.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(news.publishedAt || news.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readTime} phút đọc
          </span>
        </div>
      </div>
    </Link>
  )
}

// Loading skeleton
function NewsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [tagFilter, setTagFilter] = useState("")  // Text input for tag search like admin
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const pageSize = 12

  // Fetch data when any filter/sort changes - exactly like admin pattern
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true)
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

        // Build query params for advanced-search endpoint - matching admin
        const params = new URLSearchParams({
          page: currentPage.toString(),
          size: pageSize.toString(),
          sortBy: sortField,
          sortOrder: sortOrder,
          status: "PUBLISHED", // Only show published news for public
        })

        // Add keyword filter if searching
        if (searchQuery.trim()) {
          params.append("keyword", searchQuery.trim())
        }

        // Add category filter if selected
        if (selectedCategory && selectedCategory !== "ALL") {
          params.append("category", selectedCategory)
        }

        // Add tag filter from text input (like admin)
        if (tagFilter.trim()) {
          params.append("tag", tagFilter.trim())
        } else if (selectedTags.length > 0) {
          // Fallback to selected tags from buttons
          params.append("tag", selectedTags[0])
        }

        // Use advanced-search endpoint for full filtering support
        const url = `${API_BASE_URL}/news/advanced-search`
        console.log("Fetching news with params:", params.toString()) // Debug log
        const response = await fetch(`${url}?${params.toString()}`)
        const data = await response.json()

        if (data.result) {
          let newsData = data.result.content || []

          // If multiple tags selected, filter remaining tags on client side
          if (selectedTags.length > 1 && !tagFilter.trim()) {
            newsData = newsData.filter((item: NewsItem) =>
              selectedTags.slice(1).every(tag =>
                item.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
              )
            )
          }

          setNews(newsData)
          setTotalPages(data.result.totalPages || 1)
          setTotalElements(data.result.totalElements || newsData.length)
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        setNews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [currentPage, sortField, sortOrder, selectedCategory, searchQuery, selectedTags, tagFilter])

  // Reset page when FILTERS change (NOT sort) - exactly like admin
  useEffect(() => {
    setCurrentPage(0)
  }, [selectedCategory, searchQuery, tagFilter, selectedTags])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)
  }

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    setCurrentPage(0)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("ALL")
    setSelectedTags([])
    setTagFilter("")
    setSortField("createdAt")
    setSortOrder("desc")
    setCurrentPage(0)
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "ALL" || selectedTags.length > 0 || tagFilter

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Tin tức</h1>
          </div>
          <p className="text-muted-foreground">
            Khám phá tin tức mới nhất về sách, tác giả và các chương trình khuyến mãi
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm tin tức theo tiêu đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Tìm kiếm</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-muted")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </form>

          {/* Filter panel - Đồng bộ với admin */}
          {showFilters && (
            <div className="p-4 border rounded-lg bg-card space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Category filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh mục</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tag filter - Text input like admin */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tag..."
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Sort field - Like admin */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sắp xếp theo</label>
                  <Select value={sortField} onValueChange={setSortField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_FIELDS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort order - Like admin */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thứ tự</label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Thứ tự" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_ORDERS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Popular tags - Quick select */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags phổ biến
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm border transition-colors",
                        selectedTags.includes(tag)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}

          {/* Active filters display */}
          {hasActiveFilters && !showFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Đang lọc:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Tìm: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedCategory !== "ALL" && (
                <Badge variant="secondary" className="gap-1">
                  Danh mục: {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                  <button onClick={() => setSelectedCategory("ALL")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {tagFilter && (
                <Badge variant="secondary" className="gap-1">
                  Tag: {tagFilter}
                  <button onClick={() => setTagFilter("")} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <button onClick={() => toggleTag(tag)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tìm thấy <span className="font-medium text-foreground">{totalElements}</span> tin tức
          </p>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Trang {currentPage + 1} / {Math.max(1, totalPages)}
            </span>
          </div>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Không tìm thấy tin tức
            </h3>
            <p className="text-muted-foreground mb-4">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <NewsCard
                key={item.newsID || item.id || index}
                news={item}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = i
              if (totalPages > 5) {
                if (currentPage < 3) {
                  pageNum = i
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
