import { UserPlus, Download, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsersPageHeaderProps {
  onAddUser?: () => void
  onExport?: () => void
  className?: string
}

export function UsersPageHeader({ 
  onAddUser, 
  onExport,
  className 
}: UsersPageHeaderProps) {
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
          </div>
          <p className="text-muted-foreground">
            Quản lý thông tin người dùng, theo dõi hoạt động và xử lý tài khoản
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onExport && (
            <Button 
              variant="outline" 
              onClick={onExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất dữ liệu</span>
            </Button>
          )}
          
          {onAddUser && (
            <Button 
              onClick={onAddUser}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm người dùng</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}