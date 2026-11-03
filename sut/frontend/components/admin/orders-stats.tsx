import { PackageCheck, Truck, Clock, LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatHighlight {
  label: string
  value: number
  change: string
  icon: LucideIcon
  tone: string
}

interface OrdersStatsProps {
  className?: string
}

const defaultStatHighlights: StatHighlight[] = [
  { 
    label: "Đơn hàng hôm nay", 
    value: 42, 
    change: "+8.4%", 
    icon: PackageCheck, 
    tone: "text-primary" 
  },
  { 
    label: "Đang giao", 
    value: 16, 
    change: "+2 vận đơn mới", 
    icon: Truck, 
    tone: "text-blue-600" 
  },
  { 
    label: "Chờ xử lý", 
    value: 9, 
    change: "Ưu tiên xử lý", 
    icon: Clock, 
    tone: "text-amber-600" 
  },
]

export function OrdersStats({ className }: OrdersStatsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3", className)}>
      {defaultStatHighlights.map((stat) => (
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