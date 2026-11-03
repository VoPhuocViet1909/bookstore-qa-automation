import { apiClient, PaginatedResponse } from "../api-client";

// --- Types based on Backend DTOs ---

export enum BookStatus {
    AVAILABLE = "AVAILABLE",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    DISCONTINUED = "DISCONTINUED"
}

export interface AuthorInfo {
    id: string;
    name: string;
    biography?: string;
    dateOfBirth?: string;
    nationality?: string;
}

export interface CategoryInfo {
    id: string;
    name: string;
    description?: string;
}

export interface ImageInfo {
    id: number;
    url: string;
    priority: number;
    uploadedAt: string;
}

export interface AdminBookDetail {
    id: string;
    title: string;
    isbn: string;
    price: number;
    discountPrice: number;
    importPrice: number;
    stockQuantity: number;
    publishDate: string;
    description: string;
    status: BookStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;

    authors: AuthorInfo[];
    categories: CategoryInfo[];
    images: ImageInfo[];

    averageRating: number;
    totalReviews: number;
    totalOrders: number;
}

export interface AdminCreateBookRequest {
    title: string;
    isbn?: string;
    price: number;
    discountPrice?: number;
    importPrice?: number;
    stockQuantity: number;
    publishDate?: string;
    description?: string;
    status?: BookStatus;
    authorIds: string[];
    categoryIds: string[];
}

export interface AdminUpdateBookRequest {
    title?: string;
    isbn?: string;
    price?: number;
    discountPrice?: number;
    importPrice?: number;
    stockQuantity?: number;
    publishDate?: string;
    description?: string;
    status?: BookStatus;
    authorIds?: string[];
    categoryIds?: string[];
}

// --- Service Implementation ---

export const adminBooksService = {
    /**
     * Create a new book
     * Endpoint: POST /api/admin/books
     */
    async createBook(data: AdminCreateBookRequest): Promise<AdminBookDetail> {
        return apiClient.post<AdminBookDetail>("/admin/books", data);
    },

    /**
     * Update an existing book
     * Endpoint: PUT /api/admin/books/{bookId}
     */
    async updateBook(bookId: string, data: AdminUpdateBookRequest): Promise<AdminBookDetail> {
        return apiClient.put<AdminBookDetail>(`/admin/books/${bookId}`, data);
    },

    /**
     * Delete a book
     * Endpoint: DELETE /api/admin/books/{bookId}
     */
    async deleteBook(bookId: string): Promise<void> {
        return apiClient.delete<void>(`/admin/books/${bookId}`);
    },

    /**
     * Get book detail
     * Endpoint: GET /api/admin/books/{bookId}
     */
    async getBookDetail(bookId: string): Promise<AdminBookDetail> {
        return apiClient.get<AdminBookDetail>(`/admin/books/${bookId}`);
    },

    /**
     * Get all books with pagination
     * Endpoint: GET /api/admin/books
     */
    async getAllBooks(page: number = 0, size: number = 10): Promise<PaginatedResponse<AdminBookDetail>> {
        return apiClient.get<PaginatedResponse<AdminBookDetail>>("/admin/books", { page, size });
    },

    /**
     * Upload images for a book
     * Endpoint: POST /api/admin/books/{bookId}/images
     */
    async uploadBookImages(bookId: string, files: File[]): Promise<AdminBookDetail> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("images", file);
        });
        // Use the upload method from apiClient if it supports generic endpoint, 
        // or use custom implementation since apiClient.upload might be specific 
        // Wait, apiClient.upload uses POST.
        // However, apiClient.upload signature is (endpoint, formData) -> Promise<T>
        // So distinct files must be appended to 'images' key as the backend expects @RequestParam("images") List<MultipartFile>

        return apiClient.upload<AdminBookDetail>(`/admin/books/${bookId}/images`, formData);
    },

    /**
     * Delete a book image
     * Endpoint: DELETE /api/admin/books/{bookId}/images/{imageId}
     */
    async deleteBookImage(bookId: string, imageId: number): Promise<void> {
        return apiClient.delete<void>(`/admin/books/${bookId}/images/${imageId}`);
    }
};
