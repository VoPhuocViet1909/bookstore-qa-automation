"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

// Component that uses useSearchParams (needs Suspense boundary)
function LoginFormContent() {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect")

  // Build Google OAuth URL dynamically
  const getGoogleOAuthUrl = () => {
    if (process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL) {
      return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL
    }

    // Get backend URL from env or construct from API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
    const backendBaseUrl = apiUrl.replace("/api", "")
    const redirectUri = `${backendBaseUrl}/api/auth/google/callback`

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "890914555873-2fj89b3o9srebvjhu6a66hjehtljac8p.apps.googleusercontent.com"

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
  }



  const googleOAuthUrl = getGoogleOAuthUrl()

  const resetError = () => {
    if (error) {
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.username || !formData.password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu")
      return
    }

    try {
      const authenticatedUser = await login(formData.username, formData.password)
      const isAdmin = typeof authenticatedUser.role === "string" && authenticatedUser.role.toUpperCase() === "ADMIN"

      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push(isAdmin ? "/admin" : "/account")
      }
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        setError("Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.")
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.")
      }
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
        <label className="block text-sm font-medium text-foreground mb-2">Tên đăng nhập</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="admin"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Mật khẩu</label>
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

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-xs uppercase text-muted-foreground">
          <span className="h-px w-full bg-border" />
          <span>Hoặc</span>
          <span className="h-px w-full bg-border" />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = googleOAuthUrl
            }
          }}
        >
          <span className="flex w-full items-center justify-center gap-2">
            <FcGoogle className="h-5 w-5" />
            <span>Đăng nhập với Google</span>
          </span>
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-primary hover:text-primary/80 font-medium">
            Quên mật khẩu?
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </form>
  )
}

// Main component with Suspense boundary
export function LoginForm() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}
