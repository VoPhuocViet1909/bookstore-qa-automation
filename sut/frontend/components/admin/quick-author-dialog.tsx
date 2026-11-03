"use client"

import { useState } from "react"
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { authorsService } from "@/lib/services/authors.service"
import { useToast } from "@/components/ui/use-toast"

const authorSchema = z.object({
    name: z.string().min(2, "Tên tác giả phải có ít nhất 2 ký tự"),
    nationality: z.string().min(2, "Quốc tịch phải có ít nhất 2 ký tự").optional().or(z.literal("")),
    dateOfBirth: z.string().optional(),
    biography: z.string().optional()
})

type AuthorFormValues = z.infer<typeof authorSchema>

interface QuickAuthorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (newAuthor: { id: string, name: string }) => void
}

export function QuickAuthorDialog({ open, onOpenChange, onSuccess }: QuickAuthorDialogProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<AuthorFormValues>({
        resolver: zodResolver(authorSchema),
        defaultValues: {
            name: "",
            nationality: "",
            dateOfBirth: "",
            biography: ""
        }
    })

    const handleSubmit = async (values: AuthorFormValues) => {
        try {
            setIsSubmitting(true)
            const newAuthor = await authorsService.createAuthor({
                name: values.name,
                nationality: values.nationality || undefined,
                dateOfBirth: values.dateOfBirth || undefined,
                biography: values.biography || undefined
            })

            toast({
                title: "Thành công",
                description: "Đã thêm tác giả mới",
            })

            onSuccess({ id: newAuthor.id, name: newAuthor.name })
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error("Failed to create author", error)
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể tạo tác giả. Vui lòng thử lại.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm nhanh tác giả</DialogTitle>
                    <DialogDescription>
                        Tạo tác giả mới để thêm vào sách ngay lập tức.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên tác giả <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên tác giả" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nationality"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quốc tịch</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Việt Nam" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ngày sinh</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="biography"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tiểu sử</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Thông tin thêm về tác giả..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang tạo..." : "Tạo tác giả"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
