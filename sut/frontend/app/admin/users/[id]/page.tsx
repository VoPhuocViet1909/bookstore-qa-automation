"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, ShoppingBag, DollarSign, User, Shield, Clock, CheckCircle, XCircle, Ban, Edit } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersService, type UserManagementResponse } from "@/lib/services/users.service"
import { cn } from "@/lib/utils"

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  const [user, setUser] = useState<UserManagementResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchUserDetail()
    }
  }, [userId])

  const fetchUserDetail = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await usersService.getUserById(userId)
      
      // Parse response structure
      const userData = (response as any)?.result || (response as any)?.data || response
      setUser(userData)
    } catch (err: any) {
      console.error('Error fetching user detail:', err)
      setError(err.message || 'Không thể tải thông tin người dùng')
      toast.error('Không thể tải thông tin người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBanUser = async () => {
    if (!user) return
    try {
      await usersService.banUser(userId)
      toast.success(`Đã cấm người dùng ${user.fullName}`)
      fetchUserDetail()
    } catch (err) {
      toast.error('Không thể cấm người dùng')
    }
  }

  const handleUnbanUser = async () => {
    if (!user) return
    try {
      await usersService.unbanUser(userId)
      toast.success(`Đã bỏ cấm người dùng ${user.fullName}`)
      fetchUserDetail()
    } catch (err) {
      toast.error('Không thể bỏ cấm người dùng')
    }
  }

  const getStatusBadge = () => {
    if (!user) return null
    
    switch (user.status) {
      case "banned":
        return <Badge variant="destructive" className="flex items-center gap-1"><Ban className="w-3 h-3" />Bị cấm</Badge>
      case "inactive":
        return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Không hoạt động</Badge>
      default:
        return <Badge variant="default" className="bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Hoạt động</Badge>
    }
  }

  const getMembershipBadge = () => {
    if (!user?.membershipTier) return null
    
    const colors: Record<string, string> = {
      PLATINUM: "bg-gradient-to-r from-gray-400 to-gray-600 text-white",
      GOLD: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
      SILVER: "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800",
      BRONZE: "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
    }
    
    return (
      <Badge className={cn("flex items-center gap-1 px-3 py-1", colors[user.membershipTier] || "")}>
        <Award className="w-4 h-4" />
        {user.membershipTier}
      </Badge>
    )
  }

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy người dùng</h3>
            <p className="text-muted-foreground mb-4">{error || 'Người dùng không tồn tại hoặc đã bị xóa'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
          </div>
          
          <div className="flex gap-2">
            {user.status === "banned" ? (
              <Button variant="outline" onClick={handleUnbanUser}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Bỏ cấm
              </Button>
            ) : (
              <Button variant="outline" onClick={handleBanUser}>
                <Ban className="w-4 h-4 mr-2" />
                Cấm người dùng
              </Button>
            )}
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center md:items-start gap-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {getUserInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                {getMembershipBadge()}
              </div>

              {/* Main Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold">{user.fullName || 'N/A'}</h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {getStatusBadge()}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </Badge>
                  {user.isEmailVerified && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                      <CheckCircle className="w-3 h-3" />
                      Email đã xác thực
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{user.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ngày sinh</p>
                      <p className="font-medium">
                        {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Đăng nhập qua</p>
                      <p className="font-medium">{user.authProvider || 'LOCAL'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Đơn hàng đã đặt</p>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {user.totalSpent.toLocaleString('vi-VN')}₫
              </div>
              <p className="text-xs text-muted-foreground">
                Trung bình {user.totalOrders > 0 ? (user.totalSpent / user.totalOrders).toLocaleString('vi-VN') : 0}₫/đơn
              </p>
            </CardContent>
          </Card>

          {/* Points */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm tích lũy</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{user.points}</div>
              <p className="text-xs text-muted-foreground">Điểm thưởng</p>
            </CardContent>
          </Card>

          {/* Member Since */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thành viên từ</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} ngày
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Thông tin tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tên đăng nhập</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Vai trò</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Trạng thái</span>
                  {getStatusBadge()}
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Xác thực email</span>
                  {user.isEmailVerified ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Đã xác thực</Badge>
                  ) : (
                    <Badge variant="secondary">Chưa xác thực</Badge>
                  )}
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Phương thức đăng nhập</span>
                  <span className="font-medium">{user.authProvider}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shopping Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Thống kê mua hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tổng đơn hàng</span>
                  <span className="font-bold text-lg">{user.totalOrders}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tổng chi tiêu</span>
                  <span className="font-bold text-lg text-primary">
                    {user.totalSpent.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Giá trị trung bình/đơn</span>
                  <span className="font-medium">
                    {user.totalOrders > 0 
                      ? (user.totalSpent / user.totalOrders).toLocaleString('vi-VN')
                      : 0
                    }₫
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Điểm tích lũy</span>
                  <span className="font-bold text-yellow-600">{user.points} điểm</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Hạng thành viên</span>
                  {getMembershipBadge()}
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Đăng nhập gần nhất</span>
                  <span className="font-medium text-sm">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Chưa đăng nhập'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Ngày tạo tài khoản</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {user.lastLogin && (
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Đăng nhập gần nhất</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.lastLogin).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Cập nhật lần cuối</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.updatedAt).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
