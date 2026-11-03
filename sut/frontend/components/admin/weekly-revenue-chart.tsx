import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { cn } from "@/lib/utils"
import type { WeeklySnapshot } from "@/hooks/use-revenue-data"

interface WeeklyRevenueChartProps {
  data: WeeklySnapshot[]
  className?: string
  loading?: boolean
}

export function WeeklyRevenueChart({ data, className, loading }: WeeklyRevenueChartProps) {
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
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">
        Doanh thu trong tuần
      </h2>

      <div className="w-full h-[240px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="day"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              tickFormatter={(value) => `${value / 1_000_000}tr`}
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString("vi-VN")}₫`, "Doanh thu"]}
              labelFormatter={(label) => `Thứ ${label}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="Doanh thu"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats for mobile */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:hidden">
        <div className="text-center p-2 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Cao nhất</p>
          <p className="text-sm font-semibold text-foreground">
            {Math.max(...data.map(d => d.revenue)).toLocaleString("vi-VN")}₫
          </p>
        </div>
        <div className="text-center p-2 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">Trung bình</p>
          <p className="text-sm font-semibold text-foreground">
            {Math.round(data.reduce((sum, d) => sum + d.revenue, 0) / data.length).toLocaleString("vi-VN")}₫
          </p>
        </div>
      </div>
    </div>
  )
}