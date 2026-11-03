"use client";

import { useState, useEffect } from "react";
import { booksService, type Book } from "@/lib/services/books.service";
import { Search, X, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);

  // Fetch suggested books when modal opens
  useEffect(() => {
    if (isOpen && suggestedBooks.length === 0) {
      const fetchSuggested = async () => {
        try {
          const response = await booksService.getBooks({
            page: 0,
            pageSize: 4,
          });
          setSuggestedBooks(response.content || []);
        } catch (error) {
          console.error("Error fetching suggested books:", error);
        }
      };
      fetchSuggested();
    }
  }, [isOpen, suggestedBooks.length]);

  const popularSearches = ["Văn học", "Kinh tế", "Tâm lý học", "Công nghệ"];

  // Handle Enter key press
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        <div className="bg-background rounded-lg shadow-2xl w-full max-w-2xl mx-4">
          {/* Search Input */}
          <form onSubmit={handleSearch}>
            <div className="relative p-4 border-b border-border">
              <Search
                className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm sách, tác giả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-10 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
          </form>

          {/* Results or Popular */}
          <div className="max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4 text-foreground">
                <TrendingUp size={18} />
                <p className="font-semibold">Tìm kiếm phổ biến</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchTerm(search)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-full text-sm font-medium transition"
                  >
                    {search}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <p className="font-semibold text-foreground mb-3">
                  Gợi ý cho bạn
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedBooks.slice(0, 4).map((book) => (
                    <Link
                      key={book.id}
                      href={`/products/${book.id}`}
                      onClick={onClose}
                      className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition cursor-pointer"
                    >
                      <div className="text-center">
                        {book.mainImageUrl || book.imageUrls?.[0] ? (
                          <img
                            src={book.mainImageUrl || book.imageUrls?.[0]}
                            alt={book.title}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                        ) : (
                          <p className="text-2xl mb-2">📚</p>
                        )}
                        <p className="text-xs font-medium text-foreground line-clamp-2">
                          {book.title}
                        </p>
                        <p className="text-xs text-primary font-semibold mt-1">
                          {(book.discountPrice || book.price).toLocaleString(
                            "vi-VN"
                          )}
                          ₫
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
