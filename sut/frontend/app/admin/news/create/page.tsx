/**
 * News Creation Page - Professional CKEditor 5 Integration
 * Trang tạo tin tức mới với trình soạn thảo CKEditor 5 chuyên nghiệp
 * Standalone page - No admin layout
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, X, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import "./ckeditor-styles.css"

// Dynamically import CKEditor component to avoid SSR issues
const CKEditorComponent = dynamic(() => import("./ckeditor-component"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[600px] flex items-center justify-center border rounded-lg bg-muted/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Đang tải trình soạn thảo...</p>
      </div>
    </div>
  ),
})

export default function CreateNewsPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
  const [coverImage, setCoverImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        router.push('/login?redirect=/admin/news/create')
        return
      }

      const newsData = {
        title: title.trim(),
        summary: summary.trim() || null,
        content: content,
        category: category,
        tags: tags,
        featured: featured,
        status: publishNow ? "PUBLISHED" : "DRAFT",
        coverImage: coverImage.trim() || null,
      }

      const response = await fetch(`${API_BASE_URL}/news`, {
        method: 'POST',
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
            ? "Tin tức đã được xuất bản"
            : "Tin tức đã được lưu nháp",
        })
        router.push(`/admin/news/manage`)
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error creating news:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo tin tức. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header - Word-like */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-8 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.close()}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Đóng
            </Button>
            <div className="flex items-center gap-3 border-l pl-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold">
                  {title || "Tin tức chưa có tiêu đề"}
                </h1>
                <p className="text-xs text-gray-500">
                  {isSubmitting ? "Đang lưu..." : "Đã lưu tất cả thay đổi"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="border-gray-300"
            >
              <Save className="mr-2 h-4 w-4" />
              Lưu nháp
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              Xuất bản
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="flex">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-auto bg-gray-50" style={{ height: 'calc(100vh - 65px)' }}>
          <div className="max-w-[1400px] mx-auto py-8 px-6">
            {/* CKEditor - Full Width */}
            <div className="bg-white rounded-lg shadow-sm border">
              <CKEditorComponent
                value={content}
                onChange={(data: string) => setContent(data)}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-white overflow-auto" style={{ height: 'calc(100vh - 65px)' }}>
          <div className="p-6 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Tiêu đề</Label>
              <Input
                placeholder="Nhập tiêu đề tin tức..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-gray-300"
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Tóm tắt</Label>
              <textarea
                placeholder="Mô tả ngắn gọn về tin tức..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full min-h-[80px] p-2.5 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {summary.length}/500 ký tự
              </p>
            </div>

            <div className="border-t pt-6" />

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Danh mục</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lập trình">Lập trình</SelectItem>
                  <SelectItem value="Sách kinh tế">Sách kinh tế</SelectItem>
                  <SelectItem value="Văn học">Văn học</SelectItem>
                  <SelectItem value="Tâm lý - Kỹ năng">Tâm lý - Kỹ năng</SelectItem>
                  <SelectItem value="Thiếu nhi">Thiếu nhi</SelectItem>
                  <SelectItem value="Khuyến mãi">Khuyến mãi</SelectItem>
                  <SelectItem value="Tin tức">Tin tức</SelectItem>
                  <SelectItem value="Giải trí">Giải trí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Thêm tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="border-gray-300 text-sm"
                />
                <Button onClick={handleAddTag} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Thêm
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Ảnh bìa</Label>
              <Input
                placeholder="URL ảnh bìa"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="border-gray-300 text-sm"
              />
              {coverImage && (
                <div className="mt-2 rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-6" />

            {/* Settings */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">Cài đặt</Label>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium">Tin nổi bật</p>
                  <p className="text-xs text-gray-500">
                    Hiển thị trong mục nổi bật
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
