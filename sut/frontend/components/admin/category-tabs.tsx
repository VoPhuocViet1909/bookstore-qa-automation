"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CategoryTabsProps {
  value: string
  onChange: (value: string) => void
  categories: string[]
  className?: string
}

export function CategoryTabs({ value, onChange, categories, className }: CategoryTabsProps) {
  return (
    <div className={className}>
      <Tabs value={value} onValueChange={(newValue) => onChange(newValue)}>
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 border-b border-border/40 h-auto gap-1">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="px-3 py-2 text-xs sm:text-sm rounded-t-md whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}