"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Gift, Sparkles } from "lucide-react"

export interface WheelSegment {
  label: string
  code?: string
  isLose?: boolean
  color: string
  textColor: string
  value: string
}

interface SpinWheelProps {
  segments?: WheelSegment[]
  disabled?: boolean
  spinsRemaining?: number
  unauthenticated?: boolean
  onLoginRedirect?: () => void
  onSpinComplete: (prize: WheelSegment) => void
}

export function SpinWheel({
  onSpinComplete,
  segments = [],
  disabled = false,
  spinsRemaining = 0,
  unauthenticated = false,
  onLoginRedirect,
}: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const segmentAngle = useMemo(() => (segments.length > 0 ? 360 / segments.length : 0), [segments.length])

  useEffect(() => {
    drawWheel()
  }, [rotation, segments])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas || segments.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw shadow
    ctx.save()
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 5
    ctx.shadowOffsetY = 5
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "#fff"
    ctx.fill()
    ctx.restore()

    // Draw segments
    segments.forEach((segment, index) => {
      const startAngle = (index * segmentAngle - 90 + rotation) * (Math.PI / 180)
      const endAngle = ((index + 1) * segmentAngle - 90 + rotation) * (Math.PI / 180)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = segment.color
      ctx.fill()

      // Draw segment border
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + (segmentAngle * Math.PI) / 360)
      ctx.textAlign = "right"
      ctx.fillStyle = segment.textColor
      ctx.font = "bold 16px Geist, sans-serif"
      ctx.fillText(segment.label, radius - 14, 5)
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI)
    ctx.fillStyle = "#fff"
    ctx.fill()
    ctx.strokeStyle = "#E85D4C"
    ctx.lineWidth = 4
    ctx.stroke()

    // Draw center icon
    ctx.fillStyle = "#E85D4C"
    ctx.font = "24px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("📚", centerX, centerY)
  }

  const spin = () => {
    if (isSpinning || disabled || segments.length === 0) return

    setIsSpinning(true)

    const randomDegrees = Math.floor(Math.random() * 360)
    const spins = 5 + Math.floor(Math.random() * 3)
    const totalRotation = spins * 360 + randomDegrees

    let currentRotation = rotation
    const targetRotation = rotation + totalRotation
    const duration = 5000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4)

      currentRotation = rotation + totalRotation * easeOut
      setRotation(currentRotation % 360)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        // Calculate winning segment
        const normalizedRotation = (360 - (currentRotation % 360) + 90) % 360
        const winningIndex = Math.floor(normalizedRotation / segmentAngle) % segments.length
        onSpinComplete(segments[winningIndex])
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Pointer */}
      <div className="absolute top-0 z-10 -mt-3">
        <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[36px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
      </div>

      {/* Wheel */}
      <div className="relative mt-6">
        <canvas ref={canvasRef} width={420} height={420} className="drop-shadow-xl" />

        {/* Decorative lights */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${isSpinning ? "animate-pulse" : ""}`}
              style={{
                left: `${50 + 47 * Math.cos((i * 22.5 - 90) * (Math.PI / 180))}%`,
                top: `${50 + 47 * Math.sin((i * 22.5 - 90) * (Math.PI / 180))}%`,
                backgroundColor: i % 2 === 0 ? "#FFC107" : "#E85D4C",
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 10px ${i % 2 === 0 ? "#FFC107" : "#E85D4C"}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Spin button */}
      <Button
        onClick={unauthenticated ? onLoginRedirect : spin}
        disabled={isSpinning || disabled || segments.length === 0}
        size="lg"
        className="mt-6 px-8 py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        {isSpinning ? (
          <>
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
            Đang quay...
          </>
        ) : unauthenticated ? (
          "Đăng nhập để được quay"
        ) : segments.length === 0 ? (
          "Đang tải khuyến mãi..."
        ) : (
          <>
            <Gift className="mr-2 h-5 w-5" />
            {disabled ? "Hết lượt quay" : `QUAY NGAY (${spinsRemaining})`}
          </>
        )}
      </Button>
    </div>
  )
}
