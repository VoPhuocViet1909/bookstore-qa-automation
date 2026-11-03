"use client"

import { useState, useCallback, useEffect } from "react"
import {
    adminBooksService,
    AdminBookDetail,
    AdminCreateBookRequest,
    AdminUpdateBookRequest,
    BookStatus,
    PaginatedResponse
} from "@/lib/services/admin-books.service"
import { toast } from "sonner"

export function useAdminBooks() {
    const [loading, setLoading] = useState(false)
    const [books, setBooks] = useState<AdminBookDetail[]>([])
    const [pageData, setPageData] = useState<Omit<PaginatedResponse<AdminBookDetail>, "content">>({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0
    })

    const fetchBooks = useCallback(async (page = 0, size = 10) => {
        try {
            setLoading(true)
            const data = await adminBooksService.getAllBooks(page, size)
            setBooks(data.content || [])
            setPageData({
                currentPage: (data as any).number ?? data.currentPage ?? 0,
                totalPages: data.totalPages,
                totalElements: data.totalElements
            })
        } catch (error) {
            console.error("Failed to fetch books:", error)
            toast.error("Không thể tải danh sách sách")
        } finally {
            setLoading(false)
        }
    }, [])

    const createBook = async (data: AdminCreateBookRequest, images?: File[]) => {
        try {
            setLoading(true)
            const newBook = await adminBooksService.createBook(data)

            if (images && images.length > 0) {
                // Upload images if any
                await adminBooksService.uploadBookImages(newBook.id, images)
            }

            toast.success("Tạo sách thành công")
            fetchBooks(0) // Refresh list
            return newBook
        } catch (error) {
            console.error("Failed to create book:", error)
            toast.error("Tạo sách thất bại")
            throw error
        } finally {
            setLoading(false)
        }
    }

    const updateBook = async (id: string, data: AdminUpdateBookRequest, newImages?: File[]) => {
        try {
            setLoading(true)
            await adminBooksService.updateBook(id, data)

            if (newImages && newImages.length > 0) {
                await adminBooksService.uploadBookImages(id, newImages)
            }

            toast.success("Cập nhật sách thành công")
            fetchBooks(pageData.currentPage) // Refresh current page
        } catch (error) {
            console.error("Failed to update book:", error)
            toast.error("Cập nhật sách thất bại")
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteBook = async (id: string) => {
        try {
            setLoading(true)
            await adminBooksService.deleteBook(id)
            toast.success("Xóa sách thành công")
            fetchBooks(pageData.currentPage) // Refresh
        } catch (error) {
            console.error("Failed to delete book:", error)
            toast.error("Xóa sách thất bại")
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchBooks()
    }, [fetchBooks])

    return {
        books,
        pageData,
        loading,
        fetchBooks,
        createBook,
        updateBook,
        deleteBook
    }
}
