import { Tag, Play, Pause, Percent, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PromotionStats {
  total: number
  active: number
  inactive: number
  expired?: number
  averageDiscount: number
}

interface PromotionsStatsProps {
  stats: PromotionStats
  className?: string
}

export function PromotionsStats({ stats, className }: PromotionsStatsProps) {
  const statItems = [
    {
      label: "Tổng khuyến mãi",
      value: stats.total,
      change: "Tất cả chương trình",
      icon: Tag,
      tone: "text-primary"
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      change: `${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% tổng số`,
      icon: Play,
      tone: "text-green-600"
    },
    {
      label: "Tạm dừng",
      value: stats.inactive,
      change: `${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% tổng số`,
      icon: Pause,
      tone: "text-amber-600"
    },
    {
      label: "Đã hết hạn",
      value: stats.expired || 0,
      change: `${stats.total > 0 ? Math.round(((stats.expired || 0) / stats.total) * 100) : 0}% tổng số`,
      icon: Clock,
      tone: "text-red-600"
    },
    {
      label: "Giảm giá TB",
      value: `${stats.averageDiscount}%`,
      change: "Trung bình tất cả",
      icon: Percent,
      tone: "text-blue-600"
    }
  ]

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-5", className)}>
      {statItems.map((stat) => (
        <Card key={stat.label} className="border border-border/80 rounded-2xl shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.tone}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">
              {stat.value}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}