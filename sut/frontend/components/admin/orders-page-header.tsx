import { Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrdersPageHeaderProps {
  title?: string
  description?: string
  onExportReport?: () => void
  onDateReport?: () => void
  className?: string
}

export function OrdersPageHeader({ 
  title = "Quản lý đơn hàng",
  description = "Theo dõi trạng thái xử lý và vận chuyển đơn hàng theo thời gian thực.",
  onExportReport,
  onDateReport,
  className 
}: OrdersPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{description}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:self-end">
        <Button 
          variant="outline" 
          className="gap-2 sm:w-auto text-xs sm:text-sm"
          onClick={onDateReport}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Báo cáo theo ngày</span>
          <span className="inline sm:hidden">Báo cáo</span>
        </Button>
        <Button 
          className="gap-2 sm:w-auto text-xs sm:text-sm"
          onClick={onExportReport}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Xuất báo cáo</span>
          <span className="inline sm:hidden">Xuất</span>
        </Button>
      </div>
    </div>
  )
}