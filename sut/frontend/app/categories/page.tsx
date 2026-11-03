"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { categoriesService, CategoryWithSampleBook } from "@/lib/services/categories.service"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSampleBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getCategoriesWithSampleBook()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="py-14 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center md:mb-12">
              <h1 className="mb-3 text-3xl font-bold text-foreground md:mb-4 md:text-4xl">
                Danh mục sách
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
                Khám phá các danh mục sách đa dạng của chúng tôi
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">Không có danh mục nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                {categories.map((category) => (
                  <Link key={category.id} href={`/categories/${category.id}`}>
                    <div className="group cursor-pointer">
                      <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-muted transition group-hover:shadow-lg">
                        <div className="flex h-full w-full items-center justify-center transition group-hover:bg-secondary">
                          {category.sampleBook?.imageUrls?.[0] ? (
                            <img
                              src={category.sampleBook.imageUrls[0]}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl sm:text-5xl">📖</span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground transition group-hover:text-primary">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground sm:text-base line-clamp-2">
                        {category.description || `Khám phá ${category.name}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
