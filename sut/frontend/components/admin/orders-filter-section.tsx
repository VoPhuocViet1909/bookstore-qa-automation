import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderSearchFilter } from "./order-search-filter"
import { OrderStatusTabs } from "./order-status-tabs"
import { OrderChannelSelect } from "./order-channel-select"
import { cn } from "@/lib/utils"
import type { OrderFilterState, OrderFilterActions } from "@/hooks/use-order-filters"

interface OrdersFilterSectionProps {
  filterState: OrderFilterState
  actions: OrderFilterActions
  statusOptions: string[]
  channelOptions: string[]
  filteredCount: number
  totalCount: number
  onAdvancedFilter?: () => void
  className?: string
}

export function OrdersFilterSection({
  filterState,
  actions,
  statusOptions,
  channelOptions,
  filteredCount,
  totalCount,
  onAdvancedFilter,
  className
}: OrdersFilterSectionProps) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6", className)}>
      {/* Search và Advanced Filter */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:flex-1">
          <OrderSearchFilter
            value={filterState.searchTerm}
            onChange={actions.setSearchTerm}
            placeholder="Tìm theo mã đơn, tên khách hàng..."
            className="flex-1"
          />
          <Button 
            variant="outline" 
            className="gap-2 sm:w-auto text-xs sm:text-sm"
            onClick={onAdvancedFilter}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Bộ lọc nâng cao</span>
            <span className="inline sm:hidden">Bộ lọc</span>
          </Button>
        </div>

        {/* Channel Select và Status Tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end xl:flex-1 xl:justify-end">
          <OrderChannelSelect
            value={filterState.channel}
            onChange={actions.setChannel}
            options={channelOptions}
            placeholder="Kênh bán"
          />
          <OrderStatusTabs
            value={filterState.activeStatus}
            onChange={actions.setActiveStatus}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Filter Summary */}
      <div className="border border-dashed border-border/80 rounded-xl p-4 text-sm text-muted-foreground flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Đang hiển thị <strong>{filteredCount}</strong> trên tổng <strong>{totalCount}</strong> đơn hàng.
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="self-start sm:self-auto text-xs"
          onClick={actions.resetFilters}
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  )
}