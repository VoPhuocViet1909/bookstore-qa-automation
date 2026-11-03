"use client"

import { Plus, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description: string
  onAddNew?: () => void
  onSaveFilters?: () => void
  className?: string
}

export function PageHeader({ 
  title, 
  description, 
  onAddNew, 
  onSaveFilters, 
  className 
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center md:justify-between ${className}`}>
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:self-end w-full sm:w-auto">
        {onSaveFilters && (
          <Button 
            variant="outline" 
            className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
            onClick={onSaveFilters}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Lưu bộ lọc</span>
            <span className="inline sm:hidden">Lưu</span>
          </Button>
        )}
        {onAddNew && (
          <Button 
            className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
            onClick={onAddNew}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm mới</span>
            <span className="inline sm:hidden">Thêm</span>
          </Button>
        )}
      </div>
    </div>
  )
}