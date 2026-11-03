import { Search, Filter, X, Calendar, UserCheck, UserX, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DateRange {
  from: string
  to: string
}

interface UsersSearchFiltersProps {
  searchTerm: string
  statusFilter: string
  roleFilter?: string
  dateRange?: DateRange | null
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onRoleChange?: (value: string) => void
  onDateRangeChange?: (range: DateRange | null) => void
  onReset: () => void
  className?: string
}

export function UsersSearchFilters({
  searchTerm,
  statusFilter,
  roleFilter = "all",
  dateRange,
  onSearchChange,
  onStatusChange,
  onRoleChange,
  onDateRangeChange,
  onReset,
  className
}: UsersSearchFiltersProps) {

  const hasActiveFilters = searchTerm || statusFilter !== "all" || roleFilter !== "all" || dateRange

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", icon: Users },
    { value: "active", label: "Hoạt động", icon: UserCheck },
    { value: "inactive", label: "Không hoạt động", icon: Users },
    { value: "banned", label: "Bị cấm", icon: UserX }
  ]

  return (
    <Card className={cn("border-border", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              name="user-search-no-autofill"
              id="user-search-no-autofill"
              data-form-type="other"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="space-y-2 sm:min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground">
                Trạng thái
              </label>
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            {onRoleChange && (
              <div className="space-y-2 sm:min-w-[200px]">
                <label className="text-sm font-medium text-muted-foreground">
                  Vai trò
                </label>
                <Select value={roleFilter} onValueChange={onRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter */}
            {onDateRangeChange && (
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Ngày tham gia
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="date"
                      value={dateRange?.from || ""}
                      onChange={(e) => onDateRangeChange({
                        from: e.target.value,
                        to: dateRange?.to || ""
                      })}
                      className="pl-10"
                      placeholder="Từ ngày"
                    />
                  </div>
                  <span className="text-muted-foreground px-2">đến</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="date"
                      value={dateRange?.to || ""}
                      onChange={(e) => onDateRangeChange({
                        from: dateRange?.from || "",
                        to: e.target.value
                      })}
                      className="pl-10"
                      placeholder="Đến ngày"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters & Actions */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Bộ lọc đang áp dụng:</span>

              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="w-3 h-3" />
                  Tìm kiếm: "{searchTerm}"
                  <button
                    onClick={() => onSearchChange("")}
                    className="ml-1 hover:bg-muted rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <UserCheck className="w-3 h-3" />
                  {statusOptions.find(opt => opt.value === statusFilter)?.label}
                  <button
                    onClick={() => onStatusChange("all")}
                    className="ml-1 hover:bg-muted rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {dateRange && (dateRange.from || dateRange.to) && onDateRangeChange && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Ngày: {dateRange.from} - {dateRange.to}
                  <button
                    onClick={() => onDateRangeChange(null)}
                    className="ml-1 hover:bg-muted rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa tất cả
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}