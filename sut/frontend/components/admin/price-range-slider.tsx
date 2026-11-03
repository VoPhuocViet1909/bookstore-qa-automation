"use client"

import { Slider } from "@/components/ui/slider"

interface PriceRangeSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  currency?: string
  className?: string
}

export function PriceRangeSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 400000, 
  step = 10000,
  currency = "vi-VN",
  className 
}: PriceRangeSliderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Khoảng giá</span>
        <span className="font-semibold text-xs sm:text-sm">
          {value[0].toLocaleString(currency)}₫ - {value[1].toLocaleString(currency)}₫
        </span>
      </div>
      <div className="max-w-md">
        <Slider
          value={value}
          onValueChange={(newValue) => onChange(newValue as [number, number])}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  )
}