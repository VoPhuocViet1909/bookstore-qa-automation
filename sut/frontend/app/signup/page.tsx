import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Đăng ký</h1>
              <p className="text-muted-foreground">Tạo tài khoản mới để mua sắm</p>
            </div>

            <SignupForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
