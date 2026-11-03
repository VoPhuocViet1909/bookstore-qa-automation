"use client"

import { SearchFilter } from "./search-filter"
import { AvailabilityToggle } from "./availability-toggle"
import { PriceRangeSlider } from "./price-range-slider"
import { CategoryTabs } from "./category-tabs"
import type { FilterState, FilterActions } from "@/hooks/use-book-filters"

interface FilterSectionProps {
  filterState: FilterState
  actions: FilterActions
  categories: string[]
  className?: string
  // Configuration props để customize filter hiển thị
  showSearch?: boolean
  showAvailability?: boolean
  showPriceRange?: boolean
  showCategories?: boolean
  searchPlaceholder?: string
}

export function FilterSection({
  filterState,
  actions,
  categories,
  className,
  showSearch = true,
  showAvailability = true,
  showPriceRange = true,
  showCategories = true,
  searchPlaceholder = "Tìm kiếm..."
}: FilterSectionProps) {
  return (
    <div className={`bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm space-y-4 ${className}`}>
      {(showSearch || showAvailability) && (
        <div className="flex flex-col lg:flex-row gap-4">
          {showSearch && (
            <SearchFilter 
              value={filterState.searchTerm}
              onChange={actions.setSearchTerm}
              placeholder={searchPlaceholder}
              className="flex-1 min-w-0"
            />
          )}
          
          {showAvailability && (
            <AvailabilityToggle 
              value={filterState.activeAvailability}
              onChange={actions.setActiveAvailability}
            />
          )}
        </div>
      )}

      {showPriceRange && (
        <PriceRangeSlider 
          value={filterState.priceRange}
          onChange={actions.setPriceRange}
          min={0}
          max={400000}
          step={10000}
        />
      )}

      {showCategories && categories.length > 0 && (
        <CategoryTabs 
          value={filterState.activeCategory}
          onChange={actions.setActiveCategory}
          categories={categories}
        />
      )}
    </div>
  )
}