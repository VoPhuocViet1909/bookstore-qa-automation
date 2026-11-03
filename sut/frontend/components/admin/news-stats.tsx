/**
 * NewsStats Component
 * Hiển thị các cards thống kê tổng quan về tin tức
 */

import { NewsStatsResponse } from "@/lib/services/news.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Newspaper,
  Eye,
  TrendingUp,
  FileText,
  CheckCircle,
  FileEdit,
  Archive,
  Star
} from "lucide-react"

interface NewsStatsProps {
  stats: NewsStatsResponse
}

export function NewsStats({ stats }: NewsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Tổng tin tức */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng tin tức</CardTitle>
          <Newspaper className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalNews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.newsGrowthPercentage >= 0 ? (
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{stats.newsGrowthPercentage.toFixed(1)}% so với tháng trước
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 rotate-180" />
                {stats.newsGrowthPercentage.toFixed(1)}% so với tháng trước
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Tin đã xuất bản */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.publishedNews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalNews > 0
              ? `${((stats.publishedNews / stats.totalNews) * 100).toFixed(1)}% tổng số tin`
              : "0% tổng số tin"}
          </p>
        </CardContent>
      </Card>

      {/* Tổng lượt xem */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng lượt xem</CardTitle>
          <Eye className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.viewsGrowthPercentage >= 0 ? (
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{stats.viewsGrowthPercentage.toFixed(1)}% so với tháng trước
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 rotate-180" />
                {stats.viewsGrowthPercentage.toFixed(1)}% so với tháng trước
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Tin nổi bật */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tin nổi bật</CardTitle>
          <Star className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.featuredNews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Trung bình {stats.avgViewsPerNews.toFixed(1)} lượt xem/tin
          </p>
        </CardContent>
      </Card>

      {/* Tin nháp */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tin nháp</CardTitle>
          <FileEdit className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.draftNews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Chưa xuất bản</p>
        </CardContent>
      </Card>

      {/* Tin lưu trữ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lưu trữ</CardTitle>
          <Archive className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.archivedNews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Đã lưu trữ</p>
        </CardContent>
      </Card>

      {/* Tin tháng này */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tin tháng này</CardTitle>
          <FileText className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newNewsThisMonth.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.newNewsThisWeek} tin tuần này
          </p>
        </CardContent>
      </Card>

      {/* Tin hôm nay */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tin hôm nay</CardTitle>
          <FileText className="h-4 w-4 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newNewsToday.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Được đăng hôm nay</p>
        </CardContent>
      </Card>
    </div>
  )
}
