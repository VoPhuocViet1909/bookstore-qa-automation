"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { booksService, Book } from "@/lib/services/books.service"
import { categoriesService, CategoryWithSampleBook } from "@/lib/services/categories.service"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.slug as string
  const [books, setBooks] = useState<Book[]>([])
  const [category, setCategory] = useState<CategoryWithSampleBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalBooks, setTotalBooks] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch books by category and category details in parallel
        const [booksResponse, categoriesData] = await Promise.all([
          booksService.getBooksByCategory(categoryId, 0, 20),
          categoriesService.getCategoriesWithSampleBook(),
        ])

        setBooks(booksResponse.content)
        setTotalBooks(booksResponse.totalElements)

        // Find the matching category
        const matchedCategory = categoriesData.find(cat => cat.id === categoryId)
        setCategory(matchedCategory || null)
      } catch (error) {
        console.error("Failed to fetch category data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchData()
    }
  }, [categoryId])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <h1 className="mb-3 text-3xl font-bold text-foreground">
              {category?.name || "Danh mục sách"}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              {category?.description ||
                (books.length > 0
                  ? `Tìm thấy ${totalBooks} tựa sách trong danh mục này.`
                  : "Chưa có sách nào trong danh mục này – quay lại sau nhé!")}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {books.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <ProductCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
              Chúng tôi đang cập nhật thêm sách cho danh mục này.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
