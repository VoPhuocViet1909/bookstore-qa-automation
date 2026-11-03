/**
 * News Edit Page - Edit existing news with CKEditor 5
 * Trang chỉnh sửa tin tức với CKEditor 5
 */

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, X, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import "../../create/ckeditor-styles.css"

// Dynamically import CKEditor component to avoid SSR issues
const CKEditorComponent = dynamic(() => import("../../create/ckeditor-component"), {
    ssr: false,
    loading: () => (
        <div className="min-h-[400px] flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Đang tải trình soạn thảo...</p>
            </div>
        </div>
    ),
})

interface NewsDetail {
    newsID: string
    title: string
    summary: string
    content: string
    category: string
    tags: string[]
    views: number
    featured: boolean
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED"
    createdAt: string
    updatedAt: string
    publishedAt: string
    authorName: string
    coverImage?: string
}

export default function EditNewsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const newsId = params.id as string

    // Loading states
    const [isLoadingNews, setIsLoadingNews] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [title, setTitle] = useState("")
    const [summary, setSummary] = useState("")
    const [content, setContent] = useState("")
    const [category, setCategory] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [featured, setFeatured] = useState(false)
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT")
    const [coverImage, setCoverImage] = useState("")

    // Original news for comparison
    const [originalNews, setOriginalNews] = useState<NewsDetail | null>(null)

    // Load CKBox scripts
    useEffect(() => {
        const ckboxScript = document.createElement('script')
        ckboxScript.src = 'https://cdn.ckbox.io/ckbox/2.9.2/ckbox.js'
        ckboxScript.crossOrigin = 'anonymous'
        document.head.appendChild(ckboxScript)

        const ckboxTranslation = document.createElement('script')
        ckboxTranslation.src = 'https://cdn.ckbox.io/ckbox/2.9.2/translations/vi.js'
        ckboxTranslation.crossOrigin = 'anonymous'
        document.head.appendChild(ckboxTranslation)

        return () => {
            if (document.head.contains(ckboxScript)) {
                document.head.removeChild(ckboxScript)
            }
            if (document.head.contains(ckboxTranslation)) {
                document.head.removeChild(ckboxTranslation)
            }
        }
    }, [])

    // Fetch news data
    useEffect(() => {
        if (newsId) {
            fetchNewsDetail()
        }
    }, [newsId])

    const fetchNewsDetail = async () => {
        setIsLoadingNews(true)
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
            const response = await fetch(`${API_BASE_URL}/news/${newsId}`)
            const data = await response.json()

            if (data.result) {
                const news = data.result
                setOriginalNews(news)
                setTitle(news.title || "")
                setSummary(news.summary || "")
                setContent(news.content || "")
                setCategory(news.category || "")
                setTags(news.tags || [])
                setFeatured(news.featured || false)
                setStatus(news.status || "DRAFT")
                setCoverImage(news.coverImage || "")
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không tìm thấy tin tức",
                    variant: "destructive",
                })
                router.push('/admin/news/manage')
            }
        } catch (error) {
            console.error('Error fetching news:', error)
            toast({
                title: "Lỗi",
                description: "Không thể tải thông tin tin tức",
                variant: "destructive",
            })
        } finally {
            setIsLoadingNews(false)
        }
    }

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const handleSubmit = async (publishNow: boolean = false) => {
        // Validation
        if (!title.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tiêu đề tin tức",
                variant: "destructive",
            })
            return
        }

        if (!content.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập nội dung tin tức",
                variant: "destructive",
            })
            return
        }

        if (!category) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn danh mục",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

            // Get token from localStorage
            const token = localStorage.getItem('authToken')
            if (!token) {
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng đăng nhập lại",
                    variant: "destructive",
                })
                router.push('/login?redirect=/admin/news/' + newsId + '/edit')
                return
            }

            const newsData = {
                title: title.trim(),
                summary: summary.trim() || null,
                content: content,
                category: category,
                tags: tags,
                featured: featured,
                status: publishNow ? "PUBLISHED" : status,
                coverImage: coverImage.trim() || null,
            }

            const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newsData),
            })

            const data = await response.json()

            if (response.ok && data.result) {
                toast({
                    title: "Thành công",
                    description: publishNow
                        ? "Tin tức đã được cập nhật và xuất bản"
                        : "Tin tức đã được cập nhật",
                })
                router.push(`/admin/news/${newsId}`)
            } else {
                throw new Error(data.message || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error updating news:', error)
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật tin tức. Vui lòng thử lại.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoadingNews) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Đang tải thông tin tin tức...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Fixed Top Bar */}
            <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/news/${newsId}`)}
                            className="hover:bg-gray-100"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <div className="flex items-center gap-2 border-l pl-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">
                                {isSubmitting ? "Đang lưu..." : `Chỉnh sửa: ${title || "Tin tức"}`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Lưu thay đổi
                        </Button>
                        {status !== 'PUBLISHED' && (
                            <Button
                                size="sm"
                                onClick={() => handleSubmit(true)}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Lưu & Xuất bản
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizontal Properties Bar */}
            <div className="bg-white border-b px-6 py-3">
                <div className="grid grid-cols-12 gap-3 items-end">
                    {/* Title - 3 cols */}
                    <div className="col-span-3">
                        <Label className="text-xs font-medium mb-1 block">Tiêu đề</Label>
                        <Input
                            placeholder="Tiêu đề tin tức"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>

                    {/* Category - 2 cols */}
                    <div className="col-span-2">
                        <Label className="text-xs font-medium mb-1 block">Danh mục</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lập trình">Lập trình</SelectItem>
                                <SelectItem value="Sách kinh tế">Sách kinh tế</SelectItem>
                                <SelectItem value="Văn học">Văn học</SelectItem>
                                <SelectItem value="Tâm lý - Kỹ năng">Tâm lý</SelectItem>
                                <SelectItem value="Thiếu nhi">Thiếu nhi</SelectItem>
                                <SelectItem value="Khuyến mãi">Khuyến mãi</SelectItem>
                                <SelectItem value="Tin tức">Tin tức</SelectItem>
                                <SelectItem value="Giải trí">Giải trí</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tags - 3 cols */}
                    <div className="col-span-3">
                        <Label className="text-xs font-medium mb-1 block">Tags</Label>
                        <div className="flex gap-1">
                            <Input
                                placeholder="Nhấn Enter để thêm"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddTag()
                                    }
                                }}
                                className="h-9 text-sm flex-1"
                            />
                            <Button onClick={handleAddTag} size="sm" className="h-9 px-3">+</Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs py-0 px-1.5">
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary - 2 cols */}
                    <div className="col-span-2">
                        <Label className="text-xs font-medium mb-1 block">Tóm tắt ({summary.length}/500)</Label>
                        <textarea
                            placeholder="Tóm tắt ngắn"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full h-9 p-2 text-xs border rounded-md resize-none"
                            maxLength={500}
                        />
                    </div>

                    {/* Status + Featured - 2 cols */}
                    <div className="col-span-2 flex gap-2">
                        <div className="flex-1">
                            <Label className="text-xs font-medium mb-1 block">Trạng thái</Label>
                            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Nháp</SelectItem>
                                    <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                                    <SelectItem value="ARCHIVED">Đã ẩn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end pb-1">
                            <div className="flex items-center gap-1">
                                <Switch
                                    id="featured"
                                    checked={featured}
                                    onCheckedChange={setFeatured}
                                />
                                <Label htmlFor="featured" className="text-xs cursor-pointer whitespace-nowrap">Nổi bật</Label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Editor */}
            <div className="flex-1 overflow-auto bg-white p-6">
                <CKEditorComponent
                    value={content}
                    onChange={(data: string) => setContent(data)}
                />
            </div>
        </div>
    )
}
