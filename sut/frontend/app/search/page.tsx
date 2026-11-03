"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { booksService, type Book } from "@/lib/services/books.service";
import { ProductCard } from "@/components/products/product-card";
import { SearchIcon, Filter, X } from "lucide-react";
import { categoriesService, Category } from "@/lib/services";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000000,
    rating: 0,
    category: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoriesService.getCategories(false);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch search results - Fetch ALL books from the system
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        let allBooksData: Book[] = [];

        if (query) {
          // Fetch all matching search results
          let page = 0;
          let totalPages = 1;

          while (page < totalPages) {
            const response = await booksService.searchBooks(query, {
              page,
              pageSize: 100,
            });

            allBooksData = [...allBooksData, ...(response.content || [])];
            totalPages = response.totalPages;
            page++;
          }
          setResults(allBooksData);
        } else {
          // Fetch ALL books from the system
          let page = 0;
          let totalPages = 1;

          while (page < totalPages) {
            const response = await booksService.getBooks({
              page,
              pageSize: 100,
            });

            allBooksData = [...allBooksData, ...(response.content || [])];
            totalPages = response.totalPages;
            page++;
          }
          setResults(allBooksData);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Filter results based on filters
  const filteredResults = results.filter((book) => {
    // Category filter
    if (filters.category && !book.categoryId?.includes(filters.category)) {
      return false;
    }

    // Price filter
    const price = book.discountPrice || book.price;
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }

    // Rating filter
    if (filters.rating > 0 && (book.averageRating || 0) < filters.rating) {
      return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 10000000,
      rating: 0,
      category: "",
    });
  };

  const hasActiveFilters =
    filters.category ||
    filters.rating > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 10000000;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Search Header */}
        <div className="bg-muted/50 border-b border-border py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <SearchIcon size={24} className="text-muted-foreground" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {query ? `Kết quả tìm kiếm: "${query}"` : "Tìm kiếm"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {loading
                    ? "Đang tải..."
                    : `Tìm thấy ${filteredResults.length} sách`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">Bộ lọc</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <X size={16} /> Xóa
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3">
                      Danh mục
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={filters.category === ""}
                          onChange={() =>
                            setFilters({ ...filters, category: "" })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-foreground">Tất cả</span>
                      </label>
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="category"
                            value={category.id}
                            checked={filters.category === category.id}
                            onChange={() =>
                              setFilters({ ...filters, category: category.id })
                            }
                            className="rounded"
                          />
                          <span className="text-sm text-foreground">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium text-foreground mb-3">Giá</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Từ
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={filters.minPrice}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              minPrice: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Đến
                        </label>
                        <input
                          type="number"
                          max="500000"
                          value={filters.maxPrice}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              maxPrice: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium text-foreground mb-3">
                      Đánh giá
                    </h4>
                    <div className="space-y-2">
                      {[0, 5, 4, 3].map((rating) => (
                        <label
                          key={rating}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={filters.rating === rating}
                            onChange={() => setFilters({ ...filters, rating })}
                            className="rounded"
                          />
                          <span className="text-sm text-foreground">
                            {rating === 0 ? "Tất cả" : `${rating} sao trở lên`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted w-full justify-center"
                >
                  <Filter size={18} />
                  Bộ lọc
                </button>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mb-6 p-4 border border-border rounded-lg bg-card space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Danh mục
                    </h4>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Tất cả</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Results */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                  </div>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((book) => (
                    <ProductCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon
                    size={48}
                    className="mx-auto text-muted-foreground mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground mb-4">
                    Không tìm thấy sách phù hợp
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="text-primary hover:text-primary/80 underline"
                  >
                    Xóa các bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
