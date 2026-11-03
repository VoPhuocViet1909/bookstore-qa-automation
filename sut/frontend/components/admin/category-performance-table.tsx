import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { CategoryPerformance } from "@/hooks/use-revenue-data"

interface CategoryPerformanceTableProps {
  data: CategoryPerformance[]
  className?: string
  loading?: boolean
}

export function CategoryPerformanceTable({ data, className, loading }: CategoryPerformanceTableProps) {
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
            Hiệu suất danh mục
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Doanh thu và tăng trưởng theo danh mục sản phẩm chủ lực
          </p>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Danh mục</th>
                <th className="pb-3 font-medium">Doanh thu</th>
                <th className="pb-3 font-medium">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.category} className="border-b border-border/60 last:border-b-0">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {item.category}
                  </td>
                  <td className="py-3 pr-4 text-primary font-semibold">
                    {item.revenue.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      +{item.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3 mt-4">
        {data.map((item) => (
          <div key={item.category} className="p-3 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">{item.category}</h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                +{item.growth}%
              </span>
            </div>
            <p className="text-sm text-primary font-semibold mt-1">
              {item.revenue.toLocaleString("vi-VN")}₫
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}