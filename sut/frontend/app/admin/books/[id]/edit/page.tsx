"use client"

import { useEffect, useState, use } from "react"
import { BookForm } from "@/components/admin/book-form"
import { useAdminBooks } from "@/hooks/use-admin-books"
import { AdminCreateBookRequest, adminBooksService, AdminBookDetail, AdminUpdateBookRequest } from "@/lib/services/admin-books.service"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { updateBook } = useAdminBooks()
    const router = useRouter()
    const { toast } = useToast()
    const [book, setBook] = useState<AdminBookDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const data = await adminBooksService.getBookDetail(id)
                setBook(data)
            } catch (error) {
                console.error("Failed to fetch book details", error)
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: "Không thể tải thông tin sách.",
                })
                router.push("/admin/books") // Redirect back on error
            } finally {
                setLoading(false)
            }
        }
        fetchBook()
    }, [id, router, toast])

    const handleSubmit = async (data: AdminCreateBookRequest, images: File[]) => {
        if (!book) return

        try {
            await updateBook(book.id, data as AdminUpdateBookRequest, images)
            toast({
                title: "Thành công",
                description: "Đã cập nhật sách thành công",
            })
            router.push("/admin/books")
        } catch (error) {
            console.error("Failed to update book", error)
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể cập nhật sách. Vui lòng thử lại.",
            })
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin sách...</div>
    }

    if (!book) {
        return <div className="p-8 text-center text-red-500">Không tìm thấy sách</div>
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Cập nhật sách</h1>
                    <p className="text-muted-foreground">
                        Chỉnh sửa thông tin chi tiết của sách.
                    </p>
                </div>

                <BookForm book={book} onSubmit={handleSubmit} />
            </div>
        </div>
    )
}
