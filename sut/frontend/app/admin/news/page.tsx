/**
 * News Management Page
 * Trang quản lý tin tức cho Admin với đầy đủ thống kê
 */

"use client"

import { useNewsManagement } from "@/hooks/use-news-management"
import { NewsStats } from "@/components/admin/news-stats"
import { NewsCategoryChart } from "@/components/admin/news-category-chart"
import { TopViewedNewsChart } from "@/components/admin/top-viewed-news-chart"
import { ViewsTrendChart } from "@/components/admin/views-trend-chart"
import { FeaturedNewsList } from "@/components/admin/featured-news-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Newspaper, RefreshCw, Plus, FileDown, List } from "lucide-react"
import Link from "next/link"

export default function NewsManagementPage() {
  const { stats, isLoading, error, refreshStats } = useNewsManagement()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {/* Loading skeleton */}
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {/* Error state */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refreshStats} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Newspaper className="h-8 w-8 text-primary" />
              Quản lý tin tức
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý thông tin tin tức, theo dõi hoạt động và xử lý tài khoản
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshStats}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Link href="/admin/news/manage">
              <Button>
                <List className="mr-2 h-4 w-4" />
                Quản lý tin tức
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <NewsStats stats={stats} />

        {/* Charts Row 1: Category Distribution & Featured News */}
        <div className="grid gap-6 lg:grid-cols-2">
          <NewsCategoryChart data={stats.newsByCategory} />
          <FeaturedNewsList totalFeatured={stats.featuredNews} />
        </div>

        {/* Charts Row 2: Top Viewed News (Full Width) */}
        <TopViewedNewsChart data={stats.topViewedNews} />

        {/* Charts Row 3: Views Trend (Full Width) */}
        <ViewsTrendChart data={stats.viewsTrend} />
      </div>
    </div>
  )
}
