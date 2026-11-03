import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { PromotionFilterState, PromotionFilterActions } from "@/hooks/use-promotion-filters"

interface PromotionsFilterSectionProps {
  filterState: PromotionFilterState
  actions: PromotionFilterActions
  statusOptions: string[]
  filteredCount: number
  totalCount: number
  onAdvancedFilter?: () => void
  className?: string
}

export function PromotionsFilterSection({
  filterState,
  actions,
  statusOptions,
  filteredCount,
  totalCount,
  onAdvancedFilter,
  className
}: PromotionsFilterSectionProps) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6", className)}>
      {/* Search và Advanced Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={filterState.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc mã khuyến mãi..."
              className="pl-10"
            />
          </div>
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

        {/* Status Tabs */}
        <div className="lg:flex-1 lg:flex lg:justify-end">
          <Tabs 
            value={filterState.activeStatus} 
            onValueChange={actions.setActiveStatus}
            className="w-full lg:w-auto"
          >
            <TabsList className="w-full lg:w-auto justify-start gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/30 p-1">
              {statusOptions.map((status) => (
                <TabsTrigger key={status} value={status}>
                  {status}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Discount Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Lọc theo giảm giá: {filterState.discountRange[0]}% - {filterState.discountRange[1]}%
        </Label>
        <Slider
          value={filterState.discountRange}
          onValueChange={(range) => actions.setDiscountRange(range as [number, number])}
          max={100}
          min={0}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="border border-dashed border-border/80 rounded-xl p-4 text-sm text-muted-foreground flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Đang hiển thị <strong>{filteredCount}</strong> trên tổng <strong>{totalCount}</strong> khuyến mãi.
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