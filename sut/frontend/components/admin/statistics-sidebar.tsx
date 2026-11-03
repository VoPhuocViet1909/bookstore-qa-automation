"use client"

import { Badge } from "@/components/ui/badge"

interface Book {
  id: string
  title: string
  author: string
  price: number
  inStock: boolean
}

interface StatisticsSidebarProps {
  books: Book[]
  className?: string
}

export function StatisticsSidebar({ books, className }: StatisticsSidebarProps) {
  const booksInStock = books.filter((book) => book.inStock).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Stats */}
      <div className="bg-card border border-border rounded-lg md:rounded-xl shadow-sm p-4 md:p-5 space-y-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Thống kê nhanh</h2>
          <p className="text-xs text-muted-foreground">Trạng thái kho và hiệu suất bán sách.</p>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sách đang bán</span>
            <span className="font-semibold text-sm text-foreground">
              {booksInStock}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sách sắp hết hàng</span>
            <span className="font-semibold text-sm text-orange-500">12</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Doanh thu trung bình / sách</span>
            <span className="font-semibold text-sm text-foreground">356.000₫</span>
          </div>
        </div>
      </div>

      {/* Top Authors */}
      <div className="bg-card border border-border rounded-lg md:rounded-xl shadow-sm p-4 md:p-5 space-y-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Tác giả nổi bật</h2>
          <p className="text-xs text-muted-foreground">Đóng góp doanh thu cao nhất tuần này.</p>
        </div>
        <div className="space-y-2">
          {books.slice(0, 4).map((book) => (
            <div key={book.id} className="flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{book.author}</p>
                <p className="text-xs text-muted-foreground truncate line-clamp-1">{book.title}</p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0 px-1.5 py-0.5">
                {book.price.toLocaleString("vi-VN")}₫
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}