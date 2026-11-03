import { Trash2, Eye, Ban, UserCheck, Mail, Phone, Calendar, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { UserManagementResponse } from "@/lib/services/users.service"

interface UsersCardViewProps {
  users: UserManagementResponse[]
  onDelete: (id: string) => void
  onBan: (id: string) => void
  onUnban: (id: string) => void
  onView?: (user: UserManagementResponse) => void
  className?: string
}

export function UsersCardView({
  users,
  onDelete,
  onBan,
  onUnban,
  onView,
  className
}: UsersCardViewProps) {

  const handleDelete = (user: UserManagementResponse) => {
    onDelete(user.id)
    toast.success(`Đã xóa người dùng ${user.fullName || user.username}`)
  }

  const handleBan = (user: UserManagementResponse) => {
    onBan(user.id)
    toast.success(`Đã cấm người dùng ${user.fullName || user.username}`)
  }

  const handleUnban = (user: UserManagementResponse) => {
    onUnban(user.id)
    toast.success(`Đã bỏ cấm người dùng ${user.fullName || user.username}`)
  }

  const getStatusBadge = (user: UserManagementResponse) => {
    const status = user.status || "active"

    switch (status) {
      case "banned":
        return <Badge variant="destructive" className="text-xs">Bị cấm</Badge>
      case "inactive":
        return <Badge variant="secondary" className="text-xs">Không hoạt động</Badge>
      default:
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs">Hoạt động</Badge>
    }
  }

  const getUserInitials = (name: string | null) => {
    if (!name) return '??'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (users.length === 0) {
    return (
      <div className={cn("bg-card border border-border rounded-2xl p-8 text-center", className)}>
        <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {users.map((user) => (
        <div key={user.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{user.fullName || user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(user)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(user)}
                    className="h-8 w-8 p-0"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}

                {user.status === "banned" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnban(user)}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Bỏ cấm"
                  >
                    <UserCheck className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBan(user)}
                    className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    title="Cấm người dùng"
                  >
                    <Ban className="w-4 h-4" />
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa người dùng "{user.fullName || user.username}"?
                        Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(user)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Đơn hàng</span>
                </div>
                <p className="font-semibold text-sm text-foreground">{user.totalOrders}</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tổng chi tiêu</p>
                <p className="font-semibold text-sm text-primary">
                  {user.totalSpent.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Tham gia</span>
                </div>
                <p className="font-semibold text-xs text-foreground">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}