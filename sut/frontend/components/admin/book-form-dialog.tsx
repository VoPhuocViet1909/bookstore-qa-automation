"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { AdminBookDetail, BookStatus, AdminCreateBookRequest } from "@/lib/services/admin-books.service"
import { categoriesService } from "@/lib/services/categories.service"
import { authorsService } from "@/lib/services/authors.service"
import { MultiSelect } from "@/components/ui/multi-select"
// Let's implement a simple multi-select or just use basic select for single category first if multi-select isn't available, but the API supports list.
// I will use a simple checkbox list or look for a MultiSelect in the codebase.
// Since I don't see a MultiSelect in the file list earlier, I will implement a basic selection UI or use a simple input for comma-separated IDs if needed, but better to fetch categories.

// Schema
const bookFormSchema = z.object({
    title: z.string().min(1, "Vui lòng nhập tên sách"),
    isbn: z.string().optional(),
    price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    discountPrice: z.coerce.number().min(0).optional(),
    importPrice: z.coerce.number().min(0).optional(),
    stockQuantity: z.coerce.number().int().min(0, "Số lượng tồn kho không hợp lệ"),
    publishDate: z.string().optional(), // YYYY-MM-DD
    description: z.string().optional(),
    status: z.nativeEnum(BookStatus).default(BookStatus.AVAILABLE),
    categoryIds: z.array(z.string()).min(1, "Chọn ít nhất 1 thể loại"),
    authorIds: z.array(z.string()).optional() // For now optional, implementing author selection might need a separate service or input
})

type BookFormValues = z.infer<typeof bookFormSchema>

interface BookFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    book?: AdminBookDetail | null // If present, it's Edit mode
    onSubmit: (data: AdminCreateBookRequest, images?: File[]) => Promise<void>
}

// Temporary: a simple MultiSelect implementation if one doesn't exist
// Or I can just fetch categories and show them.

export function BookFormDialog({ open, onOpenChange, book, onSubmit }: BookFormDialogProps) {
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [authors, setAuthors] = useState<{ id: string, name: string }[]>([])
    const [selectedImages, setSelectedImages] = useState<File[]>([])

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
        } else {
            form.reset({
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
            })
        }
        setSelectedImages([])
    }, [book, form, open])

    const handleSubmit = async (values: BookFormValues) => {
        const submissionData = {
            ...values,
            authorIds: values.authorIds ?? []
        }
        await onSubmit(submissionData, selectedImages)
        onOpenChange(false)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImages(Array.from(e.target.files))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{book ? "Cập nhật sách" : "Thêm sách mới"}</DialogTitle>
                    <DialogDescription>
                        {book ? "Chỉnh sửa thông tin sách hiện có." : "Điền thông tin để tạo sách mới."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên sách</FormLabel>
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
                                        <FormLabel>ISBN</FormLabel>
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
                                        <FormLabel>Giá bán (VNĐ)</FormLabel>
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
                                        <FormLabel>Tồn kho</FormLabel>
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
                                    <FormItem className="col-span-2">
                                        <FormLabel>Thể loại</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange([value])} // Temporary single select for simplicity, or implement multiselect UI
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
                                        <FormDescription>Hiện tại hỗ trợ chọn 1 thể loại chính (Demo)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="authorIds"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Tác giả</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                options={authors.map(a => ({ label: a.name, value: a.id }))}
                                                selected={field.value || []}
                                                onChange={field.onChange}
                                                placeholder="Chọn tác giả..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trạng thái</FormLabel>
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
                                        <FormLabel>Ngày xuất bản</FormLabel>
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
                                        <Textarea placeholder="Mô tả chi tiết sách..." className="h-32" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <FormLabel>Hình ảnh</FormLabel>
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                Chọn nhiều ảnh để upload (nếu tạo mới hoặc cập nhật thêm)
                            </p>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit">
                                {book ? "Lưu thay đổi" : "Tạo sách"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
