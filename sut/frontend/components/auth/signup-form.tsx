"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { setUserState } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.username || !formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    // Validate username
    if (formData.username.length < 4) {
      setError("Tên đăng nhập phải có ít nhất 4 ký tự")
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới")
      return
    }

    // Validate username và email không trùng nhau
    if (formData.username.toLowerCase() === formData.email.toLowerCase()) {
      setError("Tên đăng nhập không được trùng với email")
      return
    }

    // Validate phone
    if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      setError("Số điện thoại phải có 10-11 chữ số")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    setIsLoading(true)
    try {
      // Import authService để gọi API trực tiếp
      const { authService } = await import("@/lib/services")
      const response = await authService.signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phone.trim(),
      })

      // Chuẩn hóa user giống AuthContext
      const authenticatedUser = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName ?? response.user.username ?? response.user.email.split("@")[0],
        role: response.user.role.toUpperCase(),
        username: response.user.username,
        phone: response.user.phoneNumber,
        avatar: response.user.avatar,
        createdAt: new Date().toISOString(),
      }

      // Lưu token và thông tin user
      localStorage.setItem("authToken", response.token)
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken)
      }
      localStorage.setItem("user", JSON.stringify(authenticatedUser))

      // Cập nhật context để header/account hiển thị ngay
      setUserState(authenticatedUser)

      router.push("/")
    } catch (err: any) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tên đăng nhập <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Nhập tên đăng nhập"
          required
          minLength={4}
          pattern="[a-zA-Z0-9_]+"
        />
        <p className="text-xs text-muted-foreground mt-1">Tối thiểu 4 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Họ và tên <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Nguyễn Văn A"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Số điện thoại <span className="text-destructive">*</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="0374425749"
          required
          pattern="[0-9]{10,11}"
        />
        <p className="text-xs text-muted-foreground mt-1">Nhập 10-11 chữ số</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Mật khẩu <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
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
        <label className="block text-sm font-medium text-foreground mb-2">
          Xác nhận mật khẩu <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
        {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
          Đăng nhập
        </Link>
      </p>
    </form>
  )
}
