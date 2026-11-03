import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface OrderStatusTabsProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  className?: string
}

export function OrderStatusTabs({ 
  value, 
  onChange, 
  options,
  className 
}: OrderStatusTabsProps) {
  return (
    <Tabs 
      value={value} 
      onValueChange={onChange}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full justify-start gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/30 p-1">
        {options.map((status) => (
          <TabsTrigger key={status} value={status}>
            {status}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}