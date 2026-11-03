/**
 * News Service
 * Handles all news-related API calls
 */

import { apiClient } from "../api-client"

// News Category Stats
export interface NewsByCategoryStats {
  category: string
  count: number
  percentage: number
}

// Top Viewed News
export interface TopViewedNews {
  id: string
  title: string
  views: number
  category: string
  publishedAt: string
}

// Views Trend Data
export interface ViewsTrendData {
  date: string
  views: number
  newsCount: number
}

// News Statistics Response (phù hợp với Backend NewsStatsResponse.java)
export interface NewsStatsResponse {
  // Tổng quan
  totalNews: number
  publishedNews: number
  draftNews: number
  archivedNews: number
  featuredNews: number

  // Theo thời gian
  newNewsThisMonth: number
  newNewsThisWeek: number
  newNewsToday: number

  // Tương tác
  totalViews: number
  avgViewsPerNews: number
  totalComments: number

  // Thống kê theo category
  newsByCategory: NewsByCategoryStats[]

  // Top tin tức
  topViewedNews: TopViewedNews[]

  // Xu hướng
  viewsTrend: ViewsTrendData[]

  // So sánh với tháng trước
  newsGrowthPercentage: number
  viewsGrowthPercentage: number
}

export const newsService = {
  /**
   * Get news statistics for Admin Dashboard
   * GET /api/news/statistics
   */
  async getStatistics(): Promise<NewsStatsResponse> {
    return apiClient.get<NewsStatsResponse>('/news/statistics')
  },
}
