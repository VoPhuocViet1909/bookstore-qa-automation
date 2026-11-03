/**
 * News Detail Page - View news details
 * Trang xem chi tiết tin tức
 */

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Edit,
    Eye,
    Calendar,
    User,
    Tag,
    Star,
    Clock,
    FileText,
    EyeOff,
    RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

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

export default function NewsDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const newsId = params.id as string

    const [news, setNews] = useState<NewsDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        if (newsId) {
            fetchNewsDetail()
        }
    }, [newsId])

    const fetchNewsDetail = async () => {
        setIsLoading(true)
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
            const response = await fetch(`${API_BASE_URL}/news/${newsId}`)
            const data = await response.json()

            if (data.result) {
                setNews(data.result)
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
            setIsLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        if (!news) return

        const actionText = news.status === 'ARCHIVED' ? 'hiển thị lại' : 'ẩn'
        if (!confirm(`Bạn có chắc chắn muốn ${actionText} tin tức "${news.title}"?`)) {
            return
        }

        setIsUpdating(true)
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
            const token = localStorage.getItem('authToken')

            if (!token) {
                toast({
                    title: "Lỗi xác thực",
                    description: "Vui lòng đăng nhập lại",
                    variant: "destructive",
                })
                return
            }

            const newStatus = news.status === 'ARCHIVED' ? 'PUBLISHED' : 'ARCHIVED'

            // Only send required fields to avoid serialization errors
            const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: news.title,
                    content: news.content,
                    category: news.category,
                    summary: news.summary || null,
                    tags: news.tags || [],
                    featured: news.featured || false,
                    status: newStatus,
                    coverImage: news.coverImage || null,
                }),
            })

            const data = await response.json()

            if (response.ok && data.result) {
                setNews({ ...news, status: newStatus })
                toast({
                    title: "Thành công",
                    description: newStatus === 'ARCHIVED' ? "Đã ẩn tin tức" : "Đã hiển thị tin tức",
                })
            } else {
                throw new Error(data.message || 'Có lỗi xảy ra')
            }
        } catch (error) {
            console.error('Error updating news:', error)
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật trạng thái tin tức",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string; className: string }> = {
            PUBLISHED: { variant: "default", label: "Đã xuất bản", className: "bg-green-500" },
            DRAFT: { variant: "secondary", label: "Nháp", className: "" },
            ARCHIVED: { variant: "outline", label: "Đã ẩn", className: "text-red-500 border-red-500" },
        }
        const config = variants[status] || variants.DRAFT
        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-muted/40">
                <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Đang tải thông tin tin tức...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-muted/40">
                <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h2 className="text-xl font-semibold mb-2">Không tìm thấy tin tức</h2>
                        <p className="text-muted-foreground mb-4">Tin tức này có thể đã bị xóa hoặc không tồn tại</p>
                        <Link href="/admin/news/manage">
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại danh sách
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/news/manage">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Chi tiết tin tức</h1>
                            <p className="text-muted-foreground text-sm">ID: {news.newsID}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleToggleStatus}
                            disabled={isUpdating}
                        >
                            {news.status === 'ARCHIVED' ? (
                                <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Hiển thị
                                </>
                            ) : (
                                <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Ẩn tin tức
                                </>
                            )}
                        </Button>
                        <Link href={`/admin/news/${newsId}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Status */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {news.featured && (
                                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                            )}
                                            {getStatusBadge(news.status)}
                                            <Badge variant="outline">{news.category}</Badge>
                                        </div>
                                        <CardTitle className="text-2xl">{news.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {news.summary && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Tóm tắt</h3>
                                        <p className="text-sm">{news.summary}</p>
                                    </div>
                                )}

                                {/* Tags */}
                                {news.tags && news.tags.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        {news.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Nội dung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: news.content }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Cover Image */}
                        {news.coverImage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Ảnh bìa</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <img
                                        src={news.coverImage}
                                        alt={news.title}
                                        className="w-full rounded-lg object-cover"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Meta Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Thông tin</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tác giả</p>
                                        <p className="text-sm font-medium">{news.authorName}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-3">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Lượt xem</p>
                                        <p className="text-sm font-medium">{news.views.toLocaleString()}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Ngày tạo</p>
                                        <p className="text-sm font-medium">
                                            {new Date(news.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {news.publishedAt && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Ngày xuất bản</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(news.publishedAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {news.updatedAt && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center gap-3">
                                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Cập nhật lần cuối</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(news.updatedAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => window.open(`/news/${newsId}`, '_blank')}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem trên trang chính
                                </Button>
                                <Link href={`/admin/news/${newsId}/edit`} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Chỉnh sửa tin tức
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
