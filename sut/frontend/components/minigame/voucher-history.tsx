"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ticket, Clock } from "lucide-react"

interface Voucher {
  code: string
  label: string
  value: string
  date: string
}

interface VoucherHistoryProps {
  vouchers: Voucher[]
}

export function VoucherHistory({ vouchers }: VoucherHistoryProps) {
  if (vouchers.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có voucher nào</p>
          <p className="text-sm">Quay ngay để nhận ưu đãi!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
          <Ticket className="h-5 w-5 text-primary" />
          Voucher của bạn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vouchers.map((voucher, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <Badge variant="secondary" className="mb-1 bg-primary/10 text-primary">
                {voucher.label}
              </Badge>
              <p className="text-xs text-muted-foreground">{voucher.value}</p>
              <code className="text-xs font-mono text-foreground">{voucher.code}</code>
            </div>
            <div className="text-right text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {voucher.date}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
