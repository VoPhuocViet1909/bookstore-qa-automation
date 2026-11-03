/**
 * Featured News List Component
 * Hiển thị danh sách tin tức nổi bật (featured = true)
 */

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Eye, Calendar } from "lucide-react"

interface FeaturedNews {
  id: string
  title: string
  views: number
  category: string
  publishedAt: string
}

interface FeaturedNewsListProps {
  totalFeatured: number
}

export function FeaturedNewsList({ totalFeatured }: FeaturedNewsListProps) {
  const [featuredNews, setFeaturedNews] = useState<FeaturedNews[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 6

  useEffect(() => {
    fetchFeaturedNews(currentPage)
  }, [currentPage])

  const fetchFeaturedNews = (page: number) => {
    setIsLoading(true)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    fetch(`${API_BASE_URL}/news?status=PUBLISHED&featured=true&page=${page}&size=${pageSize}&sort=views&order=desc`)
      .then(res => res.json())
      .then(data => {
        const result = data.result
        const newsItems = result?.content || []
        setFeaturedNews(newsItems.map((news: any) => ({
          id: news.newsID,
          title: news.title,
          views: news.views,
          category: news.category,
          publishedAt: news.publishedAt
        })))
        setTotalPages(result?.totalPages || 0)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching featured news:', error)
        setIsLoading(false)
      })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Tin tức nổi bật
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalFeatured} tin
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-20 animate-pulse" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : featuredNews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Chưa có tin tức nổi bật</p>
            </div>
          ) : (
            featuredNews.map((news, index) => (
              <div
                key={news.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => window.open(`/news/${news.id}`, '_blank')}
              >
                <div className="shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2 mb-1">
                    {news.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{news.views.toLocaleString()}</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {news.category}
                    </Badge>
                  </div>
                  {news.publishedAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(news.publishedAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {featuredNews.length > 0 && totalPages > 1 && (
          <div className="mt-4 pt-3 border-t space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Trang {currentPage + 1}/{totalPages} (Tổng {totalFeatured} tin)
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
