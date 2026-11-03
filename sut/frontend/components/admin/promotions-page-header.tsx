import { Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromotionsPageHeaderProps {
  title?: string
  description?: string
  onAddPromotion?: () => void
  onExportData?: () => void
  className?: string
}

export function PromotionsPageHeader({ 
  title = "Quản lý khuyến mãi",
  description = "Tạo và quản lý các chương trình khuyến mãi, mã giảm giá cho cửa hàng.",
  onAddPromotion,
  onExportData,
  className 
}: PromotionsPageHeaderProps) {
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
          onClick={onExportData}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Xuất dữ liệu</span>
          <span className="inline sm:hidden">Xuất</span>
        </Button>
        
        <Button 
          className="gap-2 sm:w-auto text-xs sm:text-sm"
          onClick={onAddPromotion}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm khuyến mãi</span>
          <span className="inline sm:hidden">Thêm</span>
        </Button>
      </div>
    </div>
  )
}