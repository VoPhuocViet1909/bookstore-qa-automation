"use client"

import { useRevenueData } from "@/hooks/use-revenue-data"
import {
  RevenuePageHeader,
  RevenueSummaryCards,
  RevenueChart,
  RevenueChannelsChart,
  CategoryPerformanceTable,
  WeeklyRevenueChart
} from "@/components/admin"
import { RevenueChatbot } from "@/components/admin/revenue-chatbot"



export default function AdminRevenuePage() {
  const {
    revenueByMonth,
    revenueStreams,
    categoryPerformance,
    weeklySnapshot,
    summaryCards,
    dateRange,
    chartColors,
    updateDateRange,
    exportRevenueData,
    refreshData,
    loading
  } = useRevenueData()

  // Handler functions - có thể assign cho từng developer khác nhau
  const handleRefresh = () => {
    // Developer B: Implement refresh logic
    refreshData()
  }

  const handleDateRangeChange = (newRange: any) => {
    // Developer D: Implement date range change logic
    updateDateRange(newRange)
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-6 sm:space-y-8 px-4 py-6 sm:p-6 lg:p-8">

        <RevenuePageHeader
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
        />

        <RevenueSummaryCards summaryCards={summaryCards} />

        <section className="grid grid-cols-1 2xl:grid-cols-3 gap-6 sm:gap-8">
          <RevenueChart
            data={revenueByMonth}
            className="2xl:col-span-2"
            loading={loading}
          />

          <RevenueChannelsChart
            data={revenueStreams}
            colors={chartColors}
            loading={loading}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <CategoryPerformanceTable
            data={categoryPerformance}
            className="xl:col-span-2"
            loading={loading}
          />

          <WeeklyRevenueChart
            data={weeklySnapshot}
            loading={loading}
          />
        </section>

      </div>

      {/* AI Revenue Chatbot - Proactive Assistant */}
      <RevenueChatbot />
    </div>
  )
}



