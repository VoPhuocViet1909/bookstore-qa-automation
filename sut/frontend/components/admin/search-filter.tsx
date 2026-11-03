"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchFilterProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchFilter({ value, onChange, placeholder = "Tìm kiếm...", className }: SearchFilterProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 text-xs sm:text-sm w-full"
      />
    </div>
  )
}