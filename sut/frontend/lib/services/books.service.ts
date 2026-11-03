/**
 * Books Service
 * Handles all book-related API calls
 */

import { apiClient, PaginatedResponse } from "../api-client";
import { Category } from "./categories.service";

export interface CategoryWithBooks {
  category: Category;
  books: Book[];
}

export interface Book {
  id: string;
  title: string;
  isbn?: string;
  price: number;
  discountPrice: number;
  mainImageUrl?: string; // API field
  importPrice?: number;
  stockQuantity?: number;
  publishDate?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  authorNames?: string[];
  categoryNames?: string[];
  categoryId?: string[];
  imageUrls?: string[];
  reviewCount?: number; // API field
  averageRating?: number;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  categoryId: string;
  price: number;
  discount?: number;
  description?: string;
  publisher?: string;
  publishDate?: string;
  pages?: number;
  language?: string;
  isbn?: string;
  stockQuantity: number;
  image: string;
  images?: string[];
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  id: string;
}

export interface BookFilters {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  option?: "moinhat" | "phobien" | "thapdencao" | "caodenthap" | "danhgiacao";
  danhMuc?: string[]; // Array of category IDs
  page?: number;
  size?: number;
}

export const booksService = {
  /**
   * Get paginated list of books with filters using form-data
   */
  async getBooks(filters?: BookFilters): Promise<PaginatedResponse<Book>> {
    // Build form data for the request
    const params: any = {};
    
    if (filters) {
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
      if (filters.minRating !== undefined) params.minRating = filters.minRating;
      if (filters.option) params.option = filters.option;
      if (filters.danhMuc && filters.danhMuc.length > 0) {
        // Send array as multiple params: danhMuc=cat1&danhMuc=cat2
        params.danhMuc = filters.danhMuc;
      }
      if (filters.page !== undefined) params.page = filters.page;
      if (filters.size !== undefined) params.size = filters.size;
    }
    
    return apiClient.get<PaginatedResponse<Book>>("/books/options", params);
  },

  /**
   * Get a single book by ID
   */
  async getBookById(id: string): Promise<Book> {
    return apiClient.get<Book>(`/books/${id}`);
  },

  /**
   * Get books by category ID with pagination
   */
  async getBooksByCategory(
    categoryId: string,
    page: number = 0,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Book>> {
    return apiClient.get<PaginatedResponse<Book>>(`/books/by-category/${categoryId}`, {
      page,
      pageSize,
    });
  },

  /**
   * Create a new book (Admin only)
   */
  async createBook(data: CreateBookRequest): Promise<Book> {
    return apiClient.post<Book>("/books", data);
  },

  /**
   * Update an existing book (Admin only)
   */
  async updateBook(
    id: string,
    data: Partial<CreateBookRequest>
  ): Promise<Book> {
    return apiClient.put<Book>(`/books/${id}`, data);
  },

  /**
   * Delete a book (Admin only)
   */
  async deleteBook(id: string): Promise<void> {
    return apiClient.delete<void>(`/books/${id}`);
  },

  /**
   * Get featured/recommended books
   */
  async getFeaturedBooks(limit: number = 10): Promise<Book[]> {
    return apiClient.get<Book[]>("/books/featured", { limit });
  },

  /**
   * Get best-selling books
   */
  async getBestSellers(limit: number = 10): Promise<Book[]> {
    return apiClient.get<Book[]>("/books/best-selling", { limit });
  },

  /**
   * Get suggested books
   */
  async getSuggestedBooks(limit: number = 10): Promise<Book[]> {
    return apiClient.get<Book[]>("/books/suggested", { limit });
  },

  /**
   * Get books by popular categories
   */
  async getBooksByPopularCategories(limit: number = 3): Promise<CategoryWithBooks[]> {
    return apiClient.get<CategoryWithBooks[]>("/books/by-popular-categories", { limit });
  },

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 10): Promise<Book[]> {
    return apiClient.get<Book[]>("/books/new-arrivals", { limit });
  },

  /**
   * Search books by keyword
   */
  async searchBooks(
    keyword: string,
    filters?: Omit<BookFilters, "keyword">
  ): Promise<PaginatedResponse<Book>> {
    return apiClient.get<PaginatedResponse<Book>>("/books/search", {
      keyword: keyword,
      ...filters,
    });
  },

  /**
   * Upload book cover image
   */
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.upload<{ url: string }>("/books/upload-image", formData);
  },

  /**
   * Update book stock quantity (Admin only)
   */
  async updateStock(id: string, quantity: number): Promise<Book> {
    return apiClient.patch<Book>(`/books/${id}/stock`, { quantity });
  },
};
