"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Gift, Copy, Check, BookOpen } from "lucide-react"
import { useState } from "react"

interface PrizeModalProps {
  open: boolean
  onClose: () => void
  prize: {
    label: string
    value: string
    code?: string
    isLose?: boolean
  } | null
}

export function PrizeModal({ open, onClose, prize }: PrizeModalProps) {
  const [copied, setCopied] = useState(false)

  const voucherCode = prize?.code || `BOOK${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const copyCode = () => {
    navigator.clipboard.writeText(voucherCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!prize) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Gift className="h-6 w-6" />
            Chúc mừng!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-pulse">
              <span className="text-accent-foreground text-lg">🎉</span>
            </div>
          </div>

          {prize.isLose ? (
            <>
              <p className="text-lg text-center mb-4 text-muted-foreground">Chúc bạn may mắn lần sau!</p>
              <div className="bg-muted rounded-xl p-4 mb-4 w-full text-center text-sm text-muted-foreground">
                {prize.value}
              </div>
              <Button onClick={onClose} className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Thử lại
              </Button>
            </>
          ) : (
            <>
          <p className="text-lg text-center mb-2 text-muted-foreground">Bạn đã nhận được</p>

          <div className="bg-primary/10 rounded-xl p-4 mb-4 w-full">
            <p className="text-xl font-bold text-center text-primary">{prize.label}</p>
            <p className="text-sm text-center text-muted-foreground mt-1">{prize.value}</p>
          </div>

          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-2 text-center">Mã voucher của bạn:</p>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <code className="flex-1 text-center font-mono text-lg font-bold text-foreground tracking-wider">
                {voucherCode}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode} className="shrink-0 bg-transparent">
                {copied ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Voucher có hiệu lực trong 30 ngày kể từ ngày nhận
          </p>

          <Button onClick={onClose} className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Tiếp tục mua sắm
          </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
