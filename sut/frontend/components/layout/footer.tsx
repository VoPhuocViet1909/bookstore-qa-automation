"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Về Nhà Sách</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href="/about" className="hover:opacity-100">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:opacity-100">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:opacity-100">
                  Báo chí
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Khách hàng</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href="/contact" className="hover:opacity-100">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:opacity-100">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:opacity-100">
                  Vận chuyển
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Chính sách</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href="/privacy" className="hover:opacity-100">
                  Bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:opacity-100">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="/return" className="hover:opacity-100">
                  Đổi trả
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Kết nối</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <a href="#" className="hover:opacity-100">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-75">
          <p>&copy; 2025 Nhà Sách Online. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
