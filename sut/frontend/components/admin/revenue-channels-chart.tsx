import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"
import type { RevenueStream } from "@/hooks/use-revenue-data"

interface RevenueChannelsChartProps {
  data: any[]
  colors: string[]
  className?: string
  loading?: boolean
}

export function RevenueChannelsChart({ data, colors, className, loading }: RevenueChannelsChartProps) {
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
        Doanh thu theo phương thức thanh toán
      </h2>

      <div className="w-full h-[280px] sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={95}
              dataKey="value"
              nameKey="channel"
              label={({ name, value }: any) => `${name}: ${value}%`}
            >
              {data.map((stream, index) => (
                <Cell key={stream.channel} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile-friendly legend */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:hidden">
        {data.map((stream, index) => (
          <div key={stream.channel} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-muted-foreground">{stream.channel}</span>
            </div>
            <span className="text-sm font-medium">{stream.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}