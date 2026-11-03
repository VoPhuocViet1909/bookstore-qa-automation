"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Gift, Sparkles, X } from "lucide-react"

import { SpinWheel, type WheelSegment } from "@/components/minigame/spin-wheel"
import { Confetti } from "@/components/minigame/confetti"
import { PrizeModal } from "@/components/minigame/prize-modal"
import { VoucherHistory } from "@/components/minigame/voucher-history"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { promotionsService } from "@/lib/services"
import { useAuth } from "@/lib/auth-context"

const truncateWords = (text: string, maxWords = 3) => {
  if (!text) return ""
  const parts = text.trim().split(/\s+/)
  if (parts.length <= maxWords) return text.trim()
  return parts.slice(0, maxWords).join(" ")
}

const fallbackSegments: WheelSegment[] = [
  { label: "Giảm 5%", value: "Giảm 5% đơn hàng", code: "WELCOME5", color: "#E85D4C", textColor: "#fff" },
  { label: "Giảm 20%", value: "Giảm 20% cho sách mới", code: "SACHMOI20", color: "#4CAF50", textColor: "#fff" },
  { label: "Giảm 15%", value: "Giảm 15% đơn hàng", code: "GIANGSINH15", color: "#2196F3", textColor: "#fff" },
  { label: "Giảm 50%", value: "Giảm 50% đơn hàng", code: "DTVV2025", color: "#9C27B0", textColor: "#fff" },
  { label: "Miễn ship", value: "Miễn phí vận chuyển", code: "FREESHIP", color: "#FFC107", textColor: "#333" },
]

interface Prize {
  label: string
  value: string
  code?: string
  isLose?: boolean
}

interface Voucher {
  code: string
  label: string
  value: string
  date: string
}

export function MiniGameChat() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [spinsRemaining, setSpinsRemaining] = useState(0)
  const [segments, setSegments] = useState<WheelSegment[]>([])
  const [loadingPromos, setLoadingPromos] = useState(false)

  const localKey = user ? `minigame_spins_${user.id}` : null
  const firstLoginKey = user ? `minigame_seen_${user.id}` : null

  // Luôn mở modal khi load trang (F5)
  useEffect(() => {
    setIsOpen(true)
  }, [])

  useEffect(() => {
    const loadPromotions = async () => {
      setLoadingPromos(true)
      try {
        if (!isAuthenticated) {
          // Hiển thị dữ liệu mẫu cho khách vãng lai
          const loseSegments: WheelSegment[] = [
            { label: "Chúc may mắn", value: "Chúc bạn may mắn lần sau", isLose: true, color: "#94a3b8", textColor: "#fff" },
            { label: "Hẹn gặp lại", value: "Hẹn gặp lại ở lượt quay sau", isLose: true, color: "#cbd5e1", textColor: "#111" },
            { label: "Lần sau nhé", value: "Thử vận may lần sau", isLose: true, color: "#a3a3a3", textColor: "#fff" },
            { label: "Gần trúng!", value: "Bạn suýt trúng rồi!", isLose: true, color: "#d4d4d8", textColor: "#111" },
            { label: "Tiếc quá", value: "Tiếc quá, hãy quay tiếp", isLose: true, color: "#9ca3af", textColor: "#fff" },
          ]
          setSegments([...fallbackSegments.slice(0, 5), ...loseSegments].slice(0, 10))
          return
        }

        const res = await promotionsService.getPromotions({ page: 0, size: 10 })
        const content = (res as any)?.data || (res as any)?.content || []
        const palette = ["#E85D4C", "#4CAF50", "#FF9800", "#2196F3", "#9C27B0", "#F44336", "#00BCD4", "#FFC107"]
        const mapped: WheelSegment[] = content.slice(0, 5).map((promo: any, idx: number) => ({
          label: truncateWords(promo.name || promo.code || ""),
          value: `Giảm ${promo.discount ?? promo.discountPercent ?? 0}% - ${promo.code}`,
          code: promo.code,
          color: palette[idx % palette.length],
          textColor: "#fff",
        }))
        // Thêm 4-5 ô "chúc bạn may mắn" để cân bằng tỷ lệ (tổng tối đa 9-10 ô)
        const loseSegments: WheelSegment[] = [
          { label: "Chúc may mắn", value: "Chúc bạn may mắn lần sau", isLose: true, color: "#94a3b8", textColor: "#fff" },
          { label: "Hẹn gặp lại", value: "Hẹn gặp lại ở lượt quay sau", isLose: true, color: "#cbd5e1", textColor: "#111" },
          { label: "Lần sau nhé", value: "Thử vận may lần sau", isLose: true, color: "#a3a3a3", textColor: "#fff" },
          { label: "Gần trúng!", value: "Bạn suýt trúng rồi!", isLose: true, color: "#d4d4d8", textColor: "#111" },
          { label: "Tiếc quá", value: "Tiếc quá, hãy quay tiếp", isLose: true, color: "#9ca3af", textColor: "#fff" },
        ]
        setSegments([...mapped, ...loseSegments].slice(0, 10))
      } catch (error) {
        console.error("Không thể tải khuyến mãi:", error)
        // Fallback dữ liệu mẫu nếu lỗi
        const loseSegments: WheelSegment[] = [
          { label: "Chúc may mắn", value: "Chúc bạn may mắn lần sau", isLose: true, color: "#94a3b8", textColor: "#fff" },
          { label: "Hẹn gặp lại", value: "Hẹn gặp lại ở lượt quay sau", isLose: true, color: "#cbd5e1", textColor: "#111" },
          { label: "Lần sau nhé", value: "Thử vận may lần sau", isLose: true, color: "#a3a3a3", textColor: "#fff" },
          { label: "Gần trúng!", value: "Bạn suýt trúng rồi!", isLose: true, color: "#d4d4d8", textColor: "#111" },
          { label: "Tiếc quá", value: "Tiếc quá, hãy quay tiếp", isLose: true, color: "#9ca3af", textColor: "#fff" },
        ]
        setSegments([...fallbackSegments.slice(0, 5), ...loseSegments].slice(0, 10))
      } finally {
        setLoadingPromos(false)
      }
    }

    loadPromotions()
  }, [isAuthenticated])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!user) {
      setSpinsRemaining(0)
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    if (!localKey) return

    const stored = localStorage.getItem(localKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { date?: string; remaining?: number }
        if (parsed.date === today && typeof parsed.remaining === "number") {
          setSpinsRemaining(parsed.remaining)
          return
        }
      } catch {
        /* ignore parse errors */
      }
    }

    const initial = { date: today, remaining: 3 }
    localStorage.setItem(localKey, JSON.stringify(initial))
    setSpinsRemaining(initial.remaining)
  }, [user?.id, localKey])

  // Auto open modal on first login per user (still keep tracking)
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!user || !isAuthenticated || !firstLoginKey) return

    const seen = localStorage.getItem(firstLoginKey)
    if (!seen) {
      setIsOpen(true)
      localStorage.setItem(firstLoginKey, "true")
    }
  }, [user?.id, isAuthenticated, firstLoginKey])

  const persistSpins = (next: number) => {
    if (typeof window === "undefined" || !localKey) return
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(localKey, JSON.stringify({ date: today, remaining: next }))
  }

  const handleLoginRedirect = () => {
    setIsOpen(false)
    router.push("/login")
  }

  const handleSpinComplete = (prize: Prize) => {
    setCurrentPrize(prize)
    setShowModal(true)

    if (!prize.isLose) {
      setShowConfetti(true)
    const newVoucher = {
        code: prize.code || `BOOK${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      label: prize.label,
      value: prize.value,
      date: new Date().toLocaleDateString("vi-VN"),
    }
    setVouchers((prev) => [newVoucher, ...prev])
    } else {
      setShowConfetti(false)
    }
    setSpinsRemaining((prev) => {
      const next = Math.max(0, prev - 1)
      persistSpins(next)
      return next
    })

    setTimeout(() => setShowConfetti(false), 4000)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentPrize(null)
  }

  return (
    <>
      <Confetti active={showConfetti} />
      <PrizeModal open={showModal} onClose={handleCloseModal} prize={currentPrize} />

      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-3">
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-90">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/60 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Mini game</p>
                  <p className="text-xs text-muted-foreground">Quay để nhận voucher</p>
                </div>
              </div>
              <button
                aria-label="Đóng mini game"
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

              <div className="px-6 py-5 space-y-5">
                <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Sự kiện Vòng quay may mắn</span>
                </div>
                  <div className="flex items-center gap-2">
                <span>
                      Lượt hôm nay: <span className="font-semibold text-foreground">{spinsRemaining}</span>
                </span>
                    {!isAuthenticated && <span className="text-[11px] text-destructive">Đăng nhập để nhận 3 lượt/ngày</span>}
              </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                  <div className="flex items-center justify-center">
                    <div className="scale-90 md:scale-100 origin-top">
                      <SpinWheel
                        onSpinComplete={handleSpinComplete}
                        segments={segments}
                      disabled={isAuthenticated ? spinsRemaining <= 0 : false}
                        spinsRemaining={spinsRemaining}
                      unauthenticated={!isAuthenticated}
                      onLoginRedirect={handleLoginRedirect}
                      />
                </div>
              </div>

                  <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Voucher của bạn</h3>
                      <VoucherHistory vouchers={vouchers.slice(0, 5)} />
                    </div>
              <Separator />
                    <div className="grid gap-3 sm:grid-cols-2">
                <Button
                        className="w-full bg-primary text-primary-foreground sm:col-span-2"
                  onClick={() => setIsOpen(false)}
                >
                  Đóng
                </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Gift className="h-5 w-5 mr-2" />
          Mini game
        </Button>
      </div>
    </>
  )
}

