"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductCard } from "@/components/products/product-card";
import { booksService, type Book } from "@/lib/services/books.service";
import type { FilterOptions } from "@/lib/types";
import { Filter } from "lucide-react";

const defaultFilters: FilterOptions = {
  categories: [],
  priceRange: [0, 10000000],
  ratings: [],
  sortBy: "popular",
};

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 9;

  // Fetch ALL books from API on initial load
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build API filters matching backend BookRequest
        const apiFilters: any = {
          page: currentPage - 1, // Backend uses 0-based index
          size: itemsPerPage,
        };

        // Add price range filters
        if (filters.priceRange[0] > 0) {
          apiFilters.minPrice = filters.priceRange[0];
        }
        if (filters.priceRange[1] < 10000000) {
          apiFilters.maxPrice = filters.priceRange[1];
        }

        // Add rating filter (convert to minRating)
        if (filters.ratings.length > 0) {
          apiFilters.minRating = Math.min(...filters.ratings);
        }

        // Add category filter (danhMuc array)
        if (filters.categories.length > 0) {
          apiFilters.danhMuc = filters.categories;
        }

        // Map sortBy to backend option field
        switch (filters.sortBy) {
          case 'newest':
            apiFilters.option = 'moinhat';
            break;
          case 'popular':
            apiFilters.option = 'phobien';
            break;
          case 'price-low':
            apiFilters.option = 'thapdencao';
            break;
          case 'price-high':
            apiFilters.option = 'caodenthap';
            break;
          case 'rating':
            apiFilters.option = 'danhgiacao';
            break;
          default:
            apiFilters.option = 'phobien';
        }

        const response = await booksService.getBooks(apiFilters);

        setBooks(response.content || []);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch books");
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, filters]); // Re-fetch when page or filters change

  // Filter and sort products - Now handled by backend
  const filteredProducts = useMemo(() => {
    // All filtering is done server-side, just return books
    return books;
  }, [books]);

  const handleReset = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.categories, filters.priceRange, filters.ratings, filters.sortBy]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Cửa hàng sách
            </h1>
            <p className="text-muted-foreground">
              {totalElements} sách tìm thấy
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden w-full max-w-xs shrink-0 lg:block">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleReset}
              />
            </aside>

            {/* Main Content */}
            <div className="min-w-0 flex-1">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Filter size={18} />
                  Bộ lọc
                </button>
              </div>

              {/* Mobile Filters */}
              {mobileFiltersOpen && (
                <div className="mb-6 rounded-lg border border-border bg-card p-4 lg:hidden">
                  <ProductFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onReset={handleReset}
                  />
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <p className="text-red-500 mb-2">Lỗi: {error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                    {filteredProducts.map((book, index) => {
                        try {
                          return (
                            <ProductCard
                              key={book.id || `book-${index}`}
                              book={book}
                            />
                          );
                        } catch (err) {
                          console.error("Error rendering book:", book, err);
                          return null;
                        }
                      })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-col items-center gap-4">
                      {/* Pagination controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ≪
                        </button>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Trước
                        </button>

                        <div className="flex gap-2">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`min-w-[40px] px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                    currentPage === page
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-border bg-card hover:bg-muted"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={page}
                                  className="px-2 py-2 text-muted-foreground"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sau
                        </button>

                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ≫
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Không tìm thấy sách phù hợp
                  </p>
                  <button
                    onClick={handleReset}
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
