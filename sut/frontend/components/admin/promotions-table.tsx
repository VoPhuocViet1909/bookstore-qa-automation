import { Edit, Trash2, Play, Pause, Copy, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Promotion } from "@/lib/services/promotions.service"

interface PromotionsTableProps {
  promotions: Promotion[]
  onEdit: (promotion: Promotion) => void
  onDelete: (id: string) => void
  onToggle: (id: string, currentStatus: "ACTIVE" | "INACTIVE" | "EXPIRED", isUpcoming?: boolean) => void
  sortState?: {
    sortBy: "code" | "startDate" | "discount" | null
    sortOrder: "asc" | "desc"
  }
  onSort?: (column: "code" | "startDate" | "discount") => void
  className?: string
}

export function PromotionsTable({
  promotions,
  onEdit,
  onDelete,
  onToggle,
  sortState,
  onSort,
  className
}: PromotionsTableProps) {
  
  const SortIcon = ({ column }: { column: "code" | "startDate" | "discount" }) => {
    if (!sortState || sortState.sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    }
    return sortState.sortOrder === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Đã copy mã khuyến mãi!")
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không giới hạn"
    const date = new Date(dateString)
    // Format để luôn có 2 chữ số: dd/MM/yyyy
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className={cn("border border-border rounded-2xl overflow-hidden bg-card", className)}>
      <div className="px-6 py-4 border-b border-border/60 bg-muted/40">
        <h3 className="text-sm font-medium text-muted-foreground">
          Danh sách khuyến mãi
        </h3>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-[800px] w-full">
          <thead className="text-left text-sm text-muted-foreground bg-muted/20">
            <tr>
              <th className="px-4 sm:px-6 py-3 font-medium">Thông tin</th>
              <th 
                className="px-4 sm:px-6 py-3 font-medium cursor-pointer hover:bg-muted/40 transition-colors select-none"
                onClick={() => onSort?.("code")}
              >
                <div className="flex items-center">
                  Mã khuyến mãi
                  <SortIcon column="code" />
                </div>
              </th>
              <th 
                className="px-4 sm:px-6 py-3 font-medium hidden md:table-cell cursor-pointer hover:bg-muted/40 transition-colors select-none"
                onClick={() => onSort?.("startDate")}
              >
                <div className="flex items-center">
                  Thời gian
                  <SortIcon column="startDate" />
                </div>
              </th>
              <th 
                className="px-4 sm:px-6 py-3 font-medium cursor-pointer hover:bg-muted/40 transition-colors select-none"
                onClick={() => onSort?.("discount")}
              >
                <div className="flex items-center">
                  Giảm giá
                  <SortIcon column="discount" />
                </div>
              </th>
              <th className="px-4 sm:px-6 py-3 font-medium">Trạng thái</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <p>Chưa có khuyến mãi nào</p>
                      <p className="text-sm">Thêm khuyến mãi đầu tiên để bắt đầu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => (
                  <tr key={promotion.id} className="border-t border-border/60 hover:bg-muted/40 transition">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm">
                          {promotion.name}
                        </span>
                        {(() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const startDate = new Date(promotion.startDate)
                          startDate.setHours(0, 0, 0, 0)
                          const isUpcoming = startDate > today
                          
                          return (
                            <>
                              {isUpcoming && (
                                <span className="text-xs text-blue-600 font-medium">
                                  Sẽ có hiệu lực từ {formatDate(promotion.startDate)}
                                </span>
                              )}
                              {promotion.usageLimit && !isUpcoming && (
                                <span className="text-xs text-muted-foreground">
                                  Giới hạn: {promotion.usageLimit} lần
                                </span>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {promotion.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(promotion.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="whitespace-nowrap">Từ: {formatDate(promotion.startDate)}</span>
                        <span className="whitespace-nowrap">Đến: {formatDate(promotion.endDate)}</span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-center">
                        <span className="text-lg font-bold text-primary">
                          {promotion.discount}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      {(() => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const startDate = new Date(promotion.startDate)
                        startDate.setHours(0, 0, 0, 0)
                        const isUpcoming = startDate > today
                        const displayStatus = isUpcoming ? "INACTIVE" : promotion.status
                        
                        return (
                          <Badge
                            variant={
                              displayStatus === "ACTIVE" 
                                ? "default" 
                                : displayStatus === "EXPIRED"
                                ? "destructive"
                                : "secondary"
                            }
                            className={
                              displayStatus === "ACTIVE"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : displayStatus === "EXPIRED"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : isUpcoming
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          >
                            {displayStatus === "ACTIVE"
                              ? "Hoạt động"
                              : displayStatus === "EXPIRED"
                              ? "Hết hạn"
                              : isUpcoming
                              ? "Chưa có hiệu lực"
                              : "Tạm dừng"}
                          </Badge>
                        )
                      })()}
                    </td>

                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle Button - Disabled nếu đã EXPIRED hoặc chưa đến ngày có hiệu lực */}
                        {(() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const startDate = new Date(promotion.startDate)
                          startDate.setHours(0, 0, 0, 0)
                          const isUpcoming = startDate > today
                          const isDisabled = promotion.status === "EXPIRED" || isUpcoming
                          
                          const handleClick = () => {
                            if (isDisabled) {
                              // Hiển thị thông báo khi click vào button disabled
                              if (promotion.status === "EXPIRED") {
                                toast.error("Không thể thay đổi trạng thái khuyến mãi đã hết hạn")
                              } else if (isUpcoming) {
                                toast.error(`Khuyến mãi chưa đến ngày có hiệu lực (từ ${formatDate(promotion.startDate)}). Vui lòng chờ hoặc chỉnh sửa ngày áp dụng.`)
                              }
                              return
                            }
                            onToggle(promotion.id, promotion.status, isUpcoming)
                          }
                          
                          const tooltipMessage = promotion.status === "EXPIRED"
                            ? "Không thể thay đổi trạng thái khuyến mãi đã hết hạn"
                            : isUpcoming
                            ? `Khuyến mãi chưa đến ngày có hiệu lực (từ ${formatDate(promotion.startDate)}). Vui lòng chờ hoặc chỉnh sửa ngày áp dụng trong phần chỉnh sửa.`
                            : promotion.active
                            ? "Tạm dừng khuyến mãi"
                            : "Kích hoạt khuyến mãi"
                          
                          const button = (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClick}
                              className="h-8 w-8 p-0"
                              disabled={isDisabled}
                            >
                              {promotion.active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )
                          
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  onClick={handleClick}
                                  className={isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
                                >
                                  {button}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-sm whitespace-normal">{tooltipMessage}</p>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })()}

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(promotion)}
                          className="h-8 w-8 p-0"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa khuyến mãi "{promotion.name}"?
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(promotion.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  )
}