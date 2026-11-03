/**
 * News Management Page with CRUD operations
 * Trang quản lý tin tức với tìm kiếm, lọc, sắp xếp và CRUD
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  BarChart3,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  ArrowUpDown,
  Calendar,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface NewsItem {
  newsID: string  // Backend trả về newsID (uppercase D)
  title: string
  category: string
  tags: string[]
  views: number
  featured: boolean
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  createdAt: string
  authorName?: string  // Backend trả về authorName
}

type SortField = "title" | "views" | "createdAt" | "category"
type SortOrder = "asc" | "desc"
type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED"

export default function NewsManagePage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [tagFilter, setTagFilter] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State for news data
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTagsRows, setExpandedTagsRows] = useState<Set<string>>(new Set())

  // Fetch news data from API
  useEffect(() => {
    fetchNews()
  }, [currentPage, sortField, sortOrder, searchQuery, categoryFilter, statusFilter, tagFilter])

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: (currentPage - 1).toString(),
        size: itemsPerPage.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
      })

      if (searchQuery) params.append('keyword', searchQuery)
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (tagFilter) params.append('tag', tagFilter)

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      const response = await fetch(`${API_BASE_URL}/news/advanced-search?${params.toString()}`)
      const data = await response.json()

      // Backend trả về ApiResponse wrapper với result.content
      const result = data.result || data
      if (result.content) {
        setFilteredNews(result.content)
        setTotalItems(result.totalElements || 0)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PUBLISHED: { variant: "default", label: "Đã xuất bản" },
      DRAFT: { variant: "secondary", label: "Nháp" },
      ARCHIVED: { variant: "outline", label: "Đã ẩn" },
    }
    const config = variants[status] || variants.DRAFT
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setCategoryFilter("ALL")
    setStatusFilter("ALL")
    setTagFilter("")
    setCurrentPage(1)
  }

  const toggleExpandTags = (newsID: string) => {
    setExpandedTagsRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(newsID)) {
        newSet.delete(newsID)
      } else {
        newSet.add(newsID)
      }
      return newSet
    })
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, statusFilter, tagFilter])

  // Handle view detail - open in new tab
  const handleViewDetail = (newsId: string) => {
    window.open(`/admin/news/${newsId}`, '_blank')
  }

  // Handle edit news - open in new tab
  const handleEditNews = (newsId: string) => {
    window.open(`/admin/news/${newsId}/edit`, '_blank')
  }

  // Handle hide/archive news
  const handleHideNews = async (newsId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn ẩn tin tức "${title}"?`)) {
      return
    }

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

      // First, fetch the current news data
      const fetchResponse = await fetch(`${API_BASE_URL}/news/${newsId}`)
      const fetchData = await fetchResponse.json()

      if (!fetchData.result) {
        throw new Error('Không tìm thấy tin tức')
      }

      const currentNews = fetchData.result

      // Update with all required fields + new status
      const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: currentNews.title,
          content: currentNews.content,
          category: currentNews.category,
          summary: currentNews.summary || null,
          tags: currentNews.tags || [],
          featured: currentNews.featured || false,
          status: "ARCHIVED",
          coverImage: currentNews.coverImage || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Tin tức đã được ẩn khỏi hệ thống",
        })
        // Refresh the list
        fetchNews()
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error hiding news:', error)
      toast({
        title: "Lỗi",
        description: "Không thể ẩn tin tức. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  // Handle show/publish news (restore from ARCHIVED)
  const handleShowNews = async (newsId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hiển thị lại tin tức "${title}"?`)) {
      return
    }

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

      // First, fetch the current news data
      const fetchResponse = await fetch(`${API_BASE_URL}/news/${newsId}`)
      const fetchData = await fetchResponse.json()

      if (!fetchData.result) {
        throw new Error('Không tìm thấy tin tức')
      }

      const currentNews = fetchData.result

      // Update with all required fields + new status PUBLISHED
      const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: currentNews.title,
          content: currentNews.content,
          category: currentNews.category,
          summary: currentNews.summary || null,
          tags: currentNews.tags || [],
          featured: currentNews.featured || false,
          status: "PUBLISHED",
          coverImage: currentNews.coverImage || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Tin tức đã được hiển thị lại trên hệ thống",
        })
        // Refresh the list
        fetchNews()
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error showing news:', error)
      toast({
        title: "Lỗi",
        description: "Không thể hiển thị tin tức. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              Quản lý tin tức
            </h1>
            <p className="text-muted-foreground mt-1">
              Tìm kiếm, lọc và quản lý tất cả tin tức trên hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/news">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Thống kê
              </Button>
            </Link>
            <Button
              onClick={() => window.open('/news/create', '_blank')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm tin tức
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Tìm kiếm & Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search by title/content */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tiêu đề..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter by category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Danh mục</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                    <SelectItem value="Sách mới">Sách mới</SelectItem>
                    <SelectItem value="Tác giả">Tác giả</SelectItem>
                    <SelectItem value="Sự kiện">Sự kiện</SelectItem>
                    <SelectItem value="Khuyến mãi">Khuyến mãi</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Hướng dẫn">Hướng dẫn</SelectItem>
                    <SelectItem value="Tin tức">Tin tức</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="ARCHIVED">Đã ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search by tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tag..."
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL" || tagFilter) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Bộ lọc:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Tìm kiếm: {searchQuery}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "ALL" && (
                  <Badge variant="secondary" className="gap-1">
                    Danh mục: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("ALL")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {statusFilter !== "ALL" && (
                  <Badge variant="secondary" className="gap-1">
                    Trạng thái: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("ALL")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {tagFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Tag: {tagFilter}
                    <button
                      onClick={() => setTagFilter("")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 text-xs"
                >
                  Xóa tất cả
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* News Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Danh sách tin tức ({filteredNews.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Ngày tạo</SelectItem>
                    <SelectItem value="title">Tiêu đề</SelectItem>
                    <SelectItem value="views">Lượt xem</SelectItem>
                    <SelectItem value="category">Danh mục</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-center">Lượt xem</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-center w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-20 animate-pulse" />
                        <p>Đang tải dữ liệu...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredNews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Không tìm thấy tin tức nào</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNews.map((news, index) => (
                      <TableRow key={news.newsID}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            {news.featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium line-clamp-2">{news.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Tác giả: {news.authorName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{news.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(expandedTagsRows.has(news.newsID) ? news.tags : news.tags.slice(0, 2)).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {news.tags.length > 2 && !expandedTagsRows.has(news.newsID) && (
                              <Badge
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                onClick={() => toggleExpandTags(news.newsID)}
                              >
                                +{news.tags.length - 2}
                              </Badge>
                            )}
                            {expandedTagsRows.has(news.newsID) && news.tags.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-accent"
                                onClick={() => toggleExpandTags(news.newsID)}
                              >
                                Thu gọn
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{news.views.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(news.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetail(news.newsID)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditNews(news.newsID)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {news.status === "ARCHIVED" ? (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() => handleShowNews(news.newsID, news.title)}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Hiển thị lại
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleHideNews(news.newsID, news.title)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Ẩn tin tức
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredNews.length)} trong{" "}
                  {filteredNews.length} kết quả
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
