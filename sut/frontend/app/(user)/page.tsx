"use client"

import { UserLayout } from "@/components/layout/user-layout"
import { Card, Row, Col, Button, Rate, Spin } from "antd"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Book } from "@/lib/types"

const mockBooks: Book[] = [
  {
    id: 1,
    title: "Những đứa con lạc",
    isbn: "978-1234567890",
    price: 89000,
    discountPrice: 69000,
    stockQuantity: 50,
    publishDate: "2020-05-15",
    description: "Tiểu thuyết kinh điển",
    status: "AVAILABLE",
    imageUrl: "/psychology-book.jpg",
    categoryId: 1,
    authorId: 1,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: 2,
    title: "Cách Đắc Nhân Tâm",
    isbn: "978-0987654321",
    price: 99000,
    discountPrice: 79000,
    stockQuantity: 120,
    publishDate: "2019-03-20",
    description: "Cuốn sách nổi tiếng thế giới",
    status: "AVAILABLE",
    imageUrl: "/abstract-book-cover.png",
    categoryId: 3,
    authorId: 3,
    rating: 4.9,
    reviews: 456,
  },
  {
    id: 3,
    title: "Kinh tế vi mô cơ bản",
    isbn: "978-1111111111",
    price: 129000,
    discountPrice: 99000,
    stockQuantity: 30,
    publishDate: "2021-06-10",
    description: "Giáo trình kinh tế",
    status: "AVAILABLE",
    imageUrl: "/economics-book.png",
    categoryId: 2,
    authorId: 2,
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 4,
    title: "Phương pháp KonMari",
    isbn: "978-2222222222",
    price: 85000,
    discountPrice: 65000,
    stockQuantity: 80,
    publishDate: "2021-01-15",
    description: "Phương pháp sắp xếp",
    status: "AVAILABLE",
    imageUrl: "/vietnamese-literature.jpg",
    categoryId: 4,
    authorId: 4,
    rating: 4.7,
    reviews: 340,
  },
]

export default function Home() {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  const BookCard = ({ book }: { book: Book }) => (
    <Link href={`/products/${book.id}`} className="no-underline">
      <Card
        hoverable
        cover={
          <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
            <img src={book.imageUrl || "/placeholder.svg"} alt={book.title} className="w-full h-full object-cover" />
          </div>
        }
        className="h-full"
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{book.title}</h3>
            <div className="flex items-center gap-1 mb-2">
              <Rate value={book.rating} disabled allowHalf />
              <span className="text-sm text-gray-500">({book.reviews})</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">{(book.discountPrice ?? book.price ?? 0).toLocaleString()} đ</span>
              <span className="text-sm text-gray-400 line-through">{book.price.toLocaleString()} đ</span>
            </div>
            <Button type="primary" block>
              Xem chi tiết
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )

  return (
    <UserLayout>
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-600 to-blue-400 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-4xl font-bold md:text-5xl">Khám phá thế giới sách đầy màu sắc</h1>
              <p className="mx-auto max-w-xl text-base opacity-90 sm:text-lg md:mx-0">
                Hàng triệu cuốn sách được chọn lọc cẩn thận, giao hàng nhanh, dịch vụ tốt nhất
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:justify-start">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button type="primary" size="large" className="w-full bg-white text-blue-600 hover:bg-white/90!">
                    Mua sắm ngay
                  </Button>
                </Link>
                <Link href="/categories" className="w-full sm:w-auto">
                  <Button size="large" className="w-full bg-blue-500/30 text-white hover:bg-blue-500/40">
                    Khám phá danh mục
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex aspect-square max-w-xs items-center justify-center rounded-2xl bg-white/10 backdrop-blur sm:max-w-sm">
                <div className="text-5xl sm:text-6xl">📚</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="mb-2 text-3xl font-bold">Sách bán chạy nhất</h2>
          <p className="text-gray-600">Những cuốn sách được yêu thích nhất hiện tại</p>
        </div>

        <Spin spinning={loading}>
          <Row gutter={[16, 20]}>
            {mockBooks.map((book) => (
              <Col key={book.id} xs={24} sm={12} md={12} lg={6}>
                <BookCard book={book} />
              </Col>
            ))}
          </Row>
        </Spin>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold">Danh mục phổ biến</h2>
            <p className="text-gray-600">Duyệt qua các danh mục sách yêu thích</p>
          </div>

          <Row gutter={[16, 20]}>
            {["Văn học", "Kinh tế", "Tâm lý học", "Kỹ năng"].map((category) => (
              <Col key={category} xs={24} sm={12} md={12} lg={6}>
                <Card
                  hoverable
                  className="text-center transition hover:-translate-y-1 hover:shadow-lg"
                  cover={<div className="flex h-32 items-center justify-center bg-blue-100 text-4xl sm:text-5xl">📖</div>}
                >
                  <h3 className="font-semibold text-lg">{category}</h3>
                  <p className="text-sm text-gray-600 sm:text-base">Khám phá {category}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </UserLayout>
  )
}
