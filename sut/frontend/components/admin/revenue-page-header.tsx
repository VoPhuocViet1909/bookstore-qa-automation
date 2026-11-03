import { CalendarRange, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DateRange } from "@/hooks/use-revenue-data"

interface RevenuePageHeaderProps {
  title?: string
  description?: string
  dateRange: DateRange
  onDateRangeChange?: (range: DateRange) => void
  onRefresh?: () => void
  className?: string
}

export function RevenuePageHeader({
  title = "Thống kê doanh thu",
  description = "Theo dõi doanh thu đa kênh, hiệu suất danh mục và các chỉ số tài chính quan trọng.",
  dateRange,
  onDateRangeChange,
  onRefresh,
  className
}: RevenuePageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Action Buttons */}
        {/* Date Range Inputs */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateRangeChange?.({ ...dateRange, startDate: e.target.value })}
            className="w-auto bg-card"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateRangeChange?.({ ...dateRange, endDate: e.target.value })}
            className="w-auto bg-card"
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}