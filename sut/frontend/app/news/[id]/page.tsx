/**
 * News Detail Page - Professional Full Screen Reading Experience
 * Trang xem chi tiết tin tức với thiết kế chuyên nghiệp, thu hút người đọc
 * Dành cho tất cả người dùng: guest, customer, admin
 */

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Eye,
  Clock,
  User,
  Share2,
  Bookmark,
  BookmarkCheck,
  Facebook,
  Twitter,
  Linkedin,
  Tag,
  Link as LinkIcon,
  ChevronUp,
} from "lucide-react"
import Image from "next/image"

interface NewsDetail {
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
  updatedAt?: string
  coverImage?: string
  readTime?: number
  author?: {
    name: string
    avatar: string
  }
  images: Array<{
    id: string
    url: string
    priority: number
  }>
  metadata?: {
    sections?: Array<{
      level: number
      title: string
      id: string
    }>
    description?: string
    links?: Array<{
      text: string
      url: string
      type: string
    }>
  }
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const newsId = params?.id as string

  const [news, setNews] = useState<NewsDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    if (newsId) {
      fetchNewsDetail()
    }
  }, [newsId])

  const fetchNewsDetail = async () => {
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      const response = await fetch(`${API_BASE_URL}/news/${newsId}`)
      const data = await response.json()

      console.log('API Response:', data)
      console.log('Metadata sections:', data.result?.metadata?.sections)

      if (data.result) {
        setNews(data.result)
        setIsLoading(false)
      } else {
        console.error('No result in API response')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (newsId) {
      fetchNewsDetail()
    }
  }, [newsId])

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = news?.title || ""

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    }

    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      alert("Đã sao chép link!")
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải tin tức...</p>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <svg className="h-20 w-20 mx-auto text-muted-foreground/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-lg text-muted-foreground mb-4">Không tìm thấy tin tức</p>
          <Link href="/">
            <Button className="bg-amber-700 hover:bg-amber-800">
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient background - Nâu đỏ để đồng bộ với admin */}
      <div className="bg-linear-to-r from-amber-800 via-red-800 to-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category & Featured Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm bg-white/20 text-white border-white/30 hover:bg-white/30">
              {news.category}
            </Badge>
            {news.featured && (
              <Badge variant="secondary" className="text-sm bg-yellow-500/30 text-yellow-200 border-yellow-400/30">
                ⭐ Nổi bật
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {news.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(news.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{news.authorName}</span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{news.views.toLocaleString()} lượt xem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-8 py-8">
        <article className="w-full">
          {/* Summary */}
          {news.summary && (
            <div className="bg-muted/50 border-l-4 border-primary p-6 rounded-lg mb-8">
              <p className="text-lg leading-relaxed">{news.summary}</p>
            </div>
          )}

          {/* Collapsible Table of Contents */}
          {news.metadata?.sections && news.metadata.sections.length > 0 && (
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-border rounded-lg mb-8 shadow-sm overflow-hidden">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-xl">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Mục lục</span>
                </div>
                <svg
                  className={`h-5 w-5 text-primary transition-transform duration-200 ${tocOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {tocOpen && (
                <div className="px-6 pb-6 border-t border-border/50">
                  <ul className="space-y-2.5 mt-4">
                    {news.metadata.sections.map((section, index) => (
                      <li
                        key={index}
                        style={{ paddingLeft: `${(section.level - 2) * 24}px` }}
                        className="relative"
                      >
                        <a
                          href={`#${section.id}`}
                          className="text-foreground hover:text-primary transition-all inline-flex items-center gap-2 py-1 hover:translate-x-2 duration-200 font-medium"
                          onClick={(e) => {
                            e.preventDefault()
                            const element = document.getElementById(section.id)
                            if (element) {
                              const offset = 100
                              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                              window.scrollTo({
                                top: elementPosition - offset,
                                behavior: 'smooth'
                              })
                              setTocOpen(false)
                            }
                          }}
                        >
                          <span className="text-primary/70">▸</span>
                          <span className="hover:underline">{section.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-8 pb-6 border-b">
            {/* <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              {isBookmarked ? (
                <BookmarkCheck className="mr-2 h-4 w-4" />
              ) : (
                <Bookmark className="mr-2 h-4 w-4" />
              )}
              {isBookmarked ? "Đã lưu" : "Lưu bài viết"}
            </Button> */}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Chia sẻ
            </Button>

            {showShareMenu && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("facebook")}
                  title="Chia sẻ trên Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("twitter")}
                  title="Chia sẻ trên Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("linkedin")}
                  title="Chia sẻ trên LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("copy")}
                  title="Sao chép link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Images Gallery */}
          {news.images && news.images.length > 0 && (
            <div className="mb-8 pb-8 border-b">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Thư viện ảnh
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <Image
                      src={image.url}
                      alt={`Image ${image.priority}`}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-start gap-3 pt-6 border-t">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag) => (
                <Link key={tag} href={`/news?tag=${tag}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Custom Prose Styles */}
      <style jsx global>{`
        .prose h2 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-size: 1.875rem;
          font-weight: 700;
        }
        
        .prose h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .prose p {
          margin-bottom: 1.25rem;
        }
        
        .prose blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1.5rem;
          font-style: italic;
          color: hsl(var(--muted-foreground));
          margin: 2rem 0;
        }
        
        .prose img {
          border-radius: 0.5rem;
          margin: 2rem auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .prose a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .prose ul, .prose ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .prose li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  )
}
