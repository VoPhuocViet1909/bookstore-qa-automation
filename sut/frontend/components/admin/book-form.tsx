"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { AdminBookDetail, BookStatus, AdminCreateBookRequest } from "@/lib/services/admin-books.service"
import { categoriesService } from "@/lib/services/categories.service"
import { authorsService } from "@/lib/services/authors.service"
import { MultiSelect } from "@/components/ui/multi-select"
import { useRouter } from "next/navigation"
import { QuickAuthorDialog } from "./quick-author-dialog"
import { Plus } from "lucide-react"

// Schema
// Schema
const bookFormSchema = z.object({
    title: z.string().min(1, "Vui lòng nhập tên sách"),
    isbn: z.string().min(1, "Vui lòng nhập mã ISBN"),
    price: z.coerce.number().gt(0, "Giá bán phải lớn hơn 0"),
    discountPrice: z.coerce.number().min(0).optional(),
    importPrice: z.coerce.number().min(0).optional(),
    stockQuantity: z.coerce.number().int().min(0, "Số lượng tồn kho không hợp lệ"),
    publishDate: z.string().min(1, "Vui lòng chọn ngày xuất bản")
        .refine((date) => new Date(date) <= new Date(), "Ngày xuất bản không được lớn hơn ngày hiện tại"),
    description: z.string().optional(),
    status: z.nativeEnum(BookStatus).default(BookStatus.AVAILABLE),
    categoryIds: z.array(z.string()).min(1, "Chọn ít nhất 1 thể loại"),
    authorIds: z.array(z.string()).min(1, "Chọn ít nhất 1 tác giả")
}).refine((data) => {
    if (data.discountPrice && data.price) {
        return data.discountPrice <= data.price
    }
    return true
}, {
    message: "Giá khuyến mãi không được lớn hơn giá bán gốc",
    path: ["discountPrice"]
})

type BookFormValues = z.infer<typeof bookFormSchema>

interface BookFormProps {
    book?: AdminBookDetail | null // If present, it's Update mode
    onSubmit: (data: AdminCreateBookRequest, images: File[]) => Promise<void>
    onCancel?: () => void
}

export function BookForm({ book, onSubmit, onCancel }: BookFormProps) {
    const router = useRouter()
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [authors, setAuthors] = useState<{ id: string, name: string }[]>([])
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [quickAuthorOpen, setQuickAuthorOpen] = useState(false)

    const form = useForm<BookFormValues>({
        resolver: zodResolver(bookFormSchema),
        defaultValues: {
            title: "",
            isbn: "",
            price: 0,
            discountPrice: 0,
            importPrice: 0,
            stockQuantity: 0,
            publishDate: "",
            description: "",
            status: BookStatus.AVAILABLE,
            categoryIds: [],
            authorIds: []
        }
    })

    // Load categories and authors
    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, auths] = await Promise.all([
                    categoriesService.getCategories(),
                    authorsService.getAllAuthorsForSelect()
                ])

                setCategories(cats.map((c: any) => ({
                    id: c.id,
                    name: c.name
                })))

                setAuthors(auths.map((a: any) => ({
                    id: a.id,
                    name: a.name
                })))

            } catch (err) {
                console.error("Failed to load form data", err)
            }
        }
        loadData()
    }, [])

    // Reset form when book changes
    useEffect(() => {
        if (book) {
            form.reset({
                title: book.title,
                isbn: book.isbn || "",
                price: book.price,
                discountPrice: book.discountPrice || 0,
                importPrice: book.importPrice || 0,
                stockQuantity: book.stockQuantity,
                publishDate: book.publishDate ? new Date(book.publishDate).toISOString().split('T')[0] : "",
                description: book.description || "",
                status: book.status || BookStatus.AVAILABLE,
                categoryIds: book.categories?.map(c => c.id) || [],
                authorIds: book.authors?.map(a => a.id) || []
            })
        }
        // Note: selectedImages are for *new* uploads, so we don't pre-fill them from existing URLs
        setSelectedImages([])
    }, [book, form])

    const handleSubmit = async (values: BookFormValues) => {
        try {
            // Validate Images for New Books
            if (!book && selectedImages.length === 0) {
                // Manually trigger error or toast? Since we don't have form field for images, 
                // we'll use a simple alert/toast or form setError implies field.
                // Let's use form.setError if possible, or just return.
                // But looking at UI, images usage is outside 'form' fields definition? 
                // It is just a file input.
                // We'll throw an error to be caught or just alert.
                // Since this is client side, let's use a Toast if available, otherwise native alert for now 
                // or preventing submission.
                // Note: The user prompt context doesn't show "toast" imported in book-form.tsx, 
                // but checking context, parent pages utilize toast.
                // I'll assume I can't easily add toast here without import.
                // I will add a local error state or just alert.
                // Actually, I can allow the submission to fail or use the 'setError' on a dummy field?
                // Better: Check if valid.
                alert("Vui lòng chọn ít nhất 1 hình ảnh minh họa cho sách!")
                return
            }

            setIsSubmitting(true)
            const submissionData = {
                ...values,
                authorIds: values.authorIds ?? []
            }
            await onSubmit(submissionData, selectedImages)
        } catch (error) {
            // Error handling usually done in page, but we can catch here if needed
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImages(Array.from(e.target.files))
        }
    }

    const handleQuickAuthorSuccess = (newAuthor: { id: string, name: string }) => {
        setAuthors(prev => [...prev, newAuthor])

        // Auto-select the new author
        const currentAuthors = form.getValues("authorIds") || []
        form.setValue("authorIds", [...currentAuthors, newAuthor.id])
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên sách <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập tên sách" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isbn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ISBN <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Mã ISBN" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá bán (VNĐ) <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="discountPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá khuyến mãi (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="importPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Giá nhập (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tồn kho <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryIds"
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Thể loại <span className="text-red-500">*</span></FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange([value])} // Temporary single select
                                    defaultValue={field.value?.[0]}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn thể loại" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Chọn thể loại chính của sách</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="authorIds"
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Tác giả <span className="text-red-500">*</span></FormLabel>
                                <div className="flex gap-2">
                                    <FormControl>
                                        <MultiSelect
                                            options={authors.map(a => ({ label: a.name, value: a.id }))}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Chọn tác giả..."
                                            className="flex-1"
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuickAuthorOpen(true)}
                                        title="Thêm nhanh tác giả"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Trạng thái <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={BookStatus.AVAILABLE}>Đang bán</SelectItem>
                                        <SelectItem value={BookStatus.OUT_OF_STOCK}>Hết hàng</SelectItem>
                                        <SelectItem value={BookStatus.DISCONTINUED}>Ngừng kinh doanh</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="publishDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày xuất bản <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Mô tả chi tiết sách..." className="min-h-[150px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <FormLabel>Hình ảnh</FormLabel>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors">
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="book-images"
                        />
                        <label htmlFor="book-images" className="cursor-pointer w-full h-full flex flex-col items-center">
                            <span className="text-sm font-medium mb-1">Click để tải ảnh lên</span>
                            <span className="text-xs text-muted-foreground">PNG, JPG, WEBP (Tối đa 5MB)</span>
                        </label>
                    </div>
                    {selectedImages.length > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                            Đã chọn {selectedImages.length} ảnh
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                        Hủy bỏ
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Đang xử lý..." : (book ? "Lưu thay đổi" : "Tạo sách")}
                    </Button>
                </div>
            </form>

            <QuickAuthorDialog
                open={quickAuthorOpen}
                onOpenChange={setQuickAuthorOpen}
                onSuccess={handleQuickAuthorSuccess}
            />
        </Form>
    )
}
