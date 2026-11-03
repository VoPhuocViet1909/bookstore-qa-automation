import { useMemo, useState, useEffect, useCallback } from "react"
import { DollarSign, TrendingUp, Wallet, Receipt, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { revenueService, RevenueStatisticResponse } from "@/lib/services/revenue.service"
import { format, parseISO, startOfMonth, getMonth, subMonths } from "date-fns"
import { vi } from "date-fns/locale"

export interface RevenueByMonth {
  month: string
  revenue: number
  orders: number
  avgOrderValue: number
}

export interface RevenueStream {
  channel: string
  value: number
}

export interface CategoryPerformance {
  category: string
  revenue: number
  growth: number
}

export interface WeeklySnapshot {
  day: string
  revenue: number
}

export interface SummaryCard {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
  icon: any
  accent: string
}

export interface DateRange {
  startDate: string
  endDate: string
}

export function useRevenueData() {
  // Date range state - Default to current year or a specific range
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd"), // Last 6 months
    endDate: format(new Date(), "yyyy-MM-dd") // Today
  })

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RevenueStatisticResponse | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await revenueService.getRevenueStatistics(dateRange.startDate, dateRange.endDate)
      setData(response)
    } catch (error) {
      console.error("Failed to fetch revenue stats:", error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Process data for Revenue By Month Chart
  const revenueByMonth: RevenueByMonth[] = useMemo(() => {
    if (!data?.breakdown) return []

    // Group by month
    const monthlyGroups = data.breakdown.reduce((acc, curr) => {
      const date = parseISO(curr.date)
      const monthKey = format(date, "MM/yyyy") // Group key

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: `Tháng ${format(date, "M")}`,
          revenue: 0,
          orders: 0,
          avgOrderValue: 0
        }
      }

      acc[monthKey].revenue += curr.revenue
      acc[monthKey].orders += curr.orderCount

      return acc
    }, {} as Record<string, RevenueByMonth>)

    // Calculate averages and convert to array
    return Object.values(monthlyGroups).map(item => ({
      ...item,
      avgOrderValue: item.orders > 0 ? Math.round(item.revenue / item.orders) : 0
    }))
  }, [data])

  // Process data for Weekly Snapshot (using last 7 days of the range or just the breakdown if short)
  const weeklySnapshot: WeeklySnapshot[] = useMemo(() => {
    if (!data?.breakdown) return []

    // Take the last 7 items from breakdown for the snapshot
    const last7Days = data.breakdown.slice(-7)

    return last7Days.map(item => {
      const date = parseISO(item.date)
      return {
        day: format(date, "EEEE", { locale: vi }).replace("thứ ", "T"), // Format T2, T3 etc
        revenue: item.revenue
      }
    })
  }, [data])

  // Calculated summary cards
  const summaryCards: SummaryCard[] = useMemo(() => {
    if (!data) return []

    return [
      {
        label: "Tổng doanh thu",
        value: `${data.totalRevenue?.toLocaleString("vi-VN") || 0}₫`,
        delta: "Trong khoảng thời gian này", // Tạm thời để text tĩnh
        trend: "up",
        icon: DollarSign,
        accent: "text-emerald-600",
      },
      {
        label: "Doanh thu thuần",
        value: `${(data.totalRevenue * 0.9).toLocaleString("vi-VN") || 0}₫`, // Giả định trừ thuế/phí
        delta: "Ước tính",
        trend: "up",
        icon: Wallet,
        accent: "text-blue-600",
      },
      {
        label: "Số đơn hàng",
        value: `${data.totalOrders?.toLocaleString("vi-VN") || 0} đơn`,
        delta: "Đã hoàn thành/Giao hàng",
        trend: "up",
        icon: Receipt,
        accent: "text-indigo-600",
      },
      {
        label: "Giá trị trung bình",
        value: `${(data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders) : 0).toLocaleString("vi-VN")}₫`,
        delta: "Trên mỗi đơn hàng",
        trend: "up",
        icon: TrendingUp,
        accent: "text-orange-600",
      },
    ]
  }, [data])

  // Map backend payment method stats to revenueStreams
  const revenueStreams: RevenueStream[] = useMemo(() => {
    if (!data?.revenueByPaymentMethod || data.revenueByPaymentMethod.length === 0) {
      return [
        { channel: "Chưa có dữ liệu", value: 100 }
      ]
    }

    return data.revenueByPaymentMethod.map(item => ({
      channel: item.category,
      value: item.value
    }))
  }, [data])

  const categoryPerformance: CategoryPerformance[] = useMemo(() => {
    if (!data?.categoryPerformance || data.categoryPerformance.length === 0) {
      return []
    }

    return data.categoryPerformance.map(item => ({
      category: item.category,
      revenue: item.revenue,
      growth: item.growth
    }))
  }, [data])


  // Chart colors
  const chartColors = useMemo(() => ["#8b6914", "#d4a574", "#c9957e"], [])

  // Actions
  const updateDateRange = (newRange: any) => {
    // Adapter for DateRangepicker output if needed, assuming it matches for now or we fix logic
    if (newRange?.from && newRange?.to) {
      setDateRange({
        startDate: format(newRange.from, "yyyy-MM-dd"),
        endDate: format(newRange.to, "yyyy-MM-dd")
      })
    } else if (newRange?.startDate && newRange?.endDate) {
      setDateRange(newRange)
    }
  }

  const exportRevenueData = () => {
    console.log("Exporting revenue data for:", dateRange)
  }

  const refreshData = () => {
    fetchData()
  }

  return {
    // Data
    revenueByMonth,
    revenueStreams,
    categoryPerformance,
    weeklySnapshot,
    summaryCards,
    dateRange,
    chartColors,
    loading,

    // Actions
    updateDateRange,
    exportRevenueData,
    refreshData,
  }
}