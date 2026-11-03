import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="min-h-screen flex items-start justify-center py-12 px-4 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(/background.png)' }}>
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="w-full max-w-md relative z-10 pt-24">
          <div className="bg-card/95 backdrop-blur-sm rounded-lg border border-border p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Đăng nhập</h1>
              <p className="text-muted-foreground">Đăng nhập vào tài khoản Nhà Sách Online</p>
            </div>

            <LoginForm />

            {/* <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Tài khoản demo:</p>
              <p>Tên đăng nhập: admin</p>
              <p>Mật khẩu: admin123</p>
            </div> */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
