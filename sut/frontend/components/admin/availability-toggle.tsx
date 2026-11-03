"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface AvailabilityToggleProps {
  value: string
  onChange: (value: string) => void
  options?: Array<{ label: string; value: string }>
  className?: string
}

const defaultOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Còn hàng", value: "in-stock" },
  { label: "Hết hàng", value: "out-of-stock" },
]

export function AvailabilityToggle({ 
  value, 
  onChange, 
  options = defaultOptions,
  className 
}: AvailabilityToggleProps) {
  return (
    <div className={`shrink-0 ${className}`}>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(newValue) => newValue && onChange(newValue)}
        className="flex gap-1 rounded-lg border border-border/60 bg-muted/30 p-1"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="px-3 py-1.5 text-xs whitespace-nowrap"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}