"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { authService } from "@/lib/services/auth.service"
import { message } from "antd"

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [passwordNew, setPasswordNew] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const resetError = () => {
    if (error) {
      setError("")
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Vui lòng nhập email")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ")
      return
    }

    setLoading(true)
    try {
      await authService.sendOtp(email)
      message.success("OTP đã được gửi về email của bạn")
      setStep("otp")
    } catch (err: any) {
      const errorMessage = err?.message || "Gửi OTP thất bại. Vui lòng thử lại."
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp || !passwordNew || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số")
      return
    }

    if (passwordNew.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (passwordNew !== confirmPassword) {
      setError("Mật khẩu không trùng khớp")
      return
    }

    setLoading(true)
    try {
      await authService.verifyOtp(email, otp, passwordNew, confirmPassword)
      message.success("Đổi mật khẩu thành công")
      router.push("/login")
    } catch (err: any) {
      const errorMessage = err?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại."
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Quên mật khẩu</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                resetError()
              }}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="example@email.com"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Nhớ mật khẩu?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Nhập mã OTP</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Mã OTP đã được gửi về email <span className="font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mã OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                resetError()
              }}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordNew}
                onChange={(e) => {
                  setPasswordNew(e.target.value)
                  resetError()
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  resetError()
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Quay lại
            </button>
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

