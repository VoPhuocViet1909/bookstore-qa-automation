import { Trash2, Eye, Ban, UserCheck, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { UserManagementResponse } from "@/lib/services/users.service"

interface UsersTableProps {
  users: UserManagementResponse[]
  onDelete: (id: string) => void
  onBan: (id: string) => void
  onUnban: (id: string) => void
  onView?: (user: UserManagementResponse) => void
  className?: string
}

export function UsersTable({
  users,
  onDelete,
  onBan,
  onUnban,
  onView,
  className
}: UsersTableProps) {

  const handleDelete = (user: UserManagementResponse) => {
    onDelete(user.id)
    toast.success(`Đã xóa người dùng ${user.fullName}`)
  }

  const handleBan = (user: UserManagementResponse) => {
    onBan(user.id)
    toast.success(`Đã cấm người dùng ${user.fullName}`)
  }

  const handleUnban = (user: UserManagementResponse) => {
    onUnban(user.id)
    toast.success(`Đã bỏ cấm người dùng ${user.fullName}`)
  }

  const getStatusBadge = (user: UserManagementResponse) => {
    const status = user.status || "active"

    switch (status) {
      case "banned":
        return <Badge variant="destructive">Bị cấm</Badge>
      case "inactive":
        return <Badge variant="secondary">Không hoạt động</Badge>
      default:
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Hoạt động</Badge>
    }
  }

  const getUserInitials = (name: string | null | undefined) => {
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
    <div className={cn("overflow-x-auto rounded-2xl border border-border bg-card shadow-sm", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-4">
              Người dùng
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-4 hidden md:table-cell">
              Liên hệ
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-4">
              Đơn hàng
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-4">
              Tổng chi tiêu
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-4 hidden lg:table-cell">
              Ngày tham gia
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-4">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-4">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border transition hover:bg-muted/50">
              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {getUserInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground md:hidden">{user.email}</p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4 hidden md:table-cell">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{user.phoneNumber || 'N/A'}</span>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 text-sm text-foreground sm:px-6 sm:py-4">
                <span className="font-medium">{user.totalOrders}</span>
              </td>

              <td className="px-4 py-3 font-semibold text-primary sm:px-6 sm:py-4">
                {user.totalSpent.toLocaleString("vi-VN")}₫
              </td>

              <td className="px-4 py-3 text-sm text-muted-foreground sm:px-6 sm:py-4 hidden lg:table-cell">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </td>

              <td className="px-4 py-3 sm:px-6 sm:py-4">
                {getStatusBadge(user)}
              </td>

              <td className="px-4 py-3 sm:px-6 sm:py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(user)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                    )}

                    {user.status === "banned" ? (
                      <DropdownMenuItem onClick={() => handleUnban(user)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Bỏ cấm
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleBan(user)}>
                        <Ban className="w-4 h-4 mr-2" />
                        Cấm người dùng
                      </DropdownMenuItem>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa người dùng "{user.fullName}"?
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}