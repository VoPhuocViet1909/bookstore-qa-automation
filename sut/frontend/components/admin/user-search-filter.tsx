import { Search, Filter, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { UserFilterState, UserFilterActions } from "@/hooks/use-user-filters"

interface UserSearchFilterProps {
  filterState: UserFilterState
  actions: UserFilterActions
  statusOptions: string[]
  sortOptions: Array<{ value: string; label: string }>
  filteredCount: number
  totalCount: number
  onAdvancedFilter?: () => void
  className?: string
}

export function UserSearchFilter({
  filterState,
  actions,
  statusOptions,
  sortOptions,
  filteredCount,
  totalCount,
  onAdvancedFilter,
  className
}: UserSearchFilterProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={filterState.searchTerm}
          onChange={(e) => actions.setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex-1">
          <Tabs 
            value={filterState.statusFilter} 
            onValueChange={actions.setStatusFilter}
            className="w-full"
          >
            <TabsList className="w-full justify-start gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/30 p-1">
              {statusOptions.map((status) => (
                <TabsTrigger key={status} value={status}>
                  {status}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 sm:shrink-0">
          <Select value={filterState.sortBy} onValueChange={actions.setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.setSortOrder(filterState.sortOrder === "asc" ? "desc" : "asc")}
            className="gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline">
              {filterState.sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
            </span>
          </Button>

          {onAdvancedFilter && (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={onAdvancedFilter}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Bộ lọc</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị <strong>{filteredCount}</strong> trên tổng <strong>{totalCount}</strong> người dùng
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={actions.resetFilters}
        >
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  )
}