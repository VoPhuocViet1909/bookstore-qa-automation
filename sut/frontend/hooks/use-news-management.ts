/**
 * Custom Hook: use-news-management
 * Quản lý state và logic cho News Management
 */

import { useState, useEffect, useCallback } from 'react'
import { newsService, NewsStatsResponse } from '@/lib/services/news.service'
import { toast } from 'sonner'

export function useNewsManagement() {
  const [stats, setStats] = useState<NewsStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await newsService.getStatistics()

      // Backend trả về: { code: 200, message: "...", result: NewsStatsResponse }
      const apiResponse = response as any

      if (apiResponse?.result) {
        setStats(apiResponse.result)
      } else if (apiResponse?.data) {
        setStats(apiResponse.data)
      } else {
        setStats(response)
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê tin tức')
      toast.error('Không thể tải thống kê tin tức')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load statistics on mount
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  return {
    // State
    stats,
    isLoading,
    error,

    // Actions
    refreshStats: fetchStatistics,
  }
}
