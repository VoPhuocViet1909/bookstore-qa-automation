import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SummaryCard } from "@/hooks/use-revenue-data"

interface RevenueSummaryCardsProps {
  summaryCards: SummaryCard[]
  className?: string
}

export function RevenueSummaryCards({ summaryCards, className }: RevenueSummaryCardsProps) {
  return (
    <section className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6", className)}>
      {summaryCards.map((card) => {
        const TrendIcon = card.trend === "up" ? ArrowUpRight : ArrowDownRight
        
        return (
          <article 
            key={card.label} 
            className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide truncate">
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-foreground mt-2 truncate">
                  {card.value}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ml-3">
                <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.accent}`} />
              </div>
            </div>
            <div className={cn(
              "mt-3 sm:mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium",
              card.trend === "up" ? "text-emerald-600" : "text-rose-600"
            )}>
              <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{card.delta}</span>
            </div>
          </article>
        )
      })}
    </section>
  )
}