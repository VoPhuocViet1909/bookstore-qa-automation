import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts"
import { cn } from "@/lib/utils"
import type { RevenueByMonth } from "@/hooks/use-revenue-data"

interface RevenueChartProps {
  data: RevenueByMonth[]
  className?: string
  loading?: boolean
}

function ComposedRevenueChart({ data }: { data: RevenueByMonth[] }) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
      <YAxis
        yAxisId="left"
        stroke="var(--color-muted-foreground)"
        tickFormatter={(value) => `${Math.round(value / 1_000_000)}tr`}
      />
      <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" />
      <Tooltip
        formatter={(value: number, name) => {
          if (name === "Doanh thu") {
            return [`${value.toLocaleString("vi-VN")}₫`, name]
          }
          if (name === "Giá trị trung bình") {
            return [`${value.toLocaleString("vi-VN")}₫`, name]
          }
          return [value, name]
        }}
      />
      <Legend />
      <Bar
        yAxisId="left"
        dataKey="revenue"
        name="Doanh thu"
        fill="var(--color-primary)"
        radius={[8, 8, 0, 0]}
      />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="orders"
        name="Số đơn hàng"
        stroke="#82ca9d"
        strokeWidth={2}
        activeDot={{ r: 6 }}
      />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="avgOrderValue"
        name="Giá trị trung bình"
        stroke="#d97706"
        strokeWidth={2}
        strokeDasharray="5 5"
      />
    </BarChart>
  )
}

export function RevenueChart({ data, className, loading }: RevenueChartProps) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm relative", className)}>
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">Đang tải...</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Doanh thu & đơn hàng theo tháng
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            So sánh tăng trưởng doanh thu và số đơn trong 6 tháng
          </p>
        </div>
      </div>

      <div className="w-full h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedRevenueChart data={data} />
        </ResponsiveContainer>
      </div>
    </div>
  )
}