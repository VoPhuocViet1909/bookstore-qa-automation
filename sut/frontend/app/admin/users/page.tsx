"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useUserManagement } from "@/hooks/use-user-management"
import { useIsMobile } from "@/hooks/use-mobile"
import { usersService, CreateUserRequest } from "@/lib/services/users.service"
import {
  UsersPageHeader,
  UsersStats,
  UsersSearchFilters,
  UsersTable,
  UsersCardView,
  AddUserModal
} from "@/components/admin"
import type { CreateUserData } from "@/components/admin/add-user-modal"

export default function AdminUsersPage() {
  const isMobile = useIsMobile()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const {
    users,
    stats,
    filterState,
    filterActions,
    userActions,
    isLoading,
    error,
    totalPages,
    totalUsers
  } = useUserManagement()

  // Event handlers
  const handleAddUser = () => {
    setIsAddModalOpen(true)
  }

  const handleSubmitNewUser = async (userData: CreateUserData) => {
    try {
      // Prepare request data
      const requestData: CreateUserRequest = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber || undefined,
        gender: userData.gender || undefined,
        avatarUrl: userData.avatarUrl || undefined,
        dateOfBirth: userData.dateOfBirth || undefined,
        role: userData.role || 'CUSTOMER',
      }

      // Call API
      await usersService.createUser(requestData)

      // Refresh user list
      await userActions.refreshUsers()
    } catch (error: any) {
      // Re-throw to let modal handle the error display
      throw error
    }
  }

  const handleExport = async () => {
    const toastId = toast.loading("Đang xuất dữ liệu người dùng...")

    try {
      const blob = await usersService.exportUsers()

      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error("File xuất ra rỗng")
      }

      // Generate filename with current date and time
      const now = new Date()
      const filename = `DanhSachNguoiDung_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`

      // Check if File System Access API is supported (Chrome/Edge)
      if ('showSaveFilePicker' in window) {
        try {
          // @ts-ignore - File System Access API
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'Excel Files',
              accept: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
              }
            }]
          })

          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()

          toast.success(`Đã lưu file "${filename}" thành công!`, { id: toastId })
          return
        } catch (saveErr: any) {
          // User cancelled or error occurred
          if (saveErr.name === 'AbortError') {
            toast.info("Đã hủy xuất file", { id: toastId })
            return
          }
          // Fall through to traditional download
        }
      }

      // Fallback: Traditional download (for Firefox, Safari, older browsers)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      toast.success(`Đã xuất ${totalUsers} người dùng ra file Excel`, { id: toastId })
    } catch (err: any) {
      toast.error(err.message || "Không thể xuất dữ liệu người dùng", { id: toastId })
    }
  }

  const handleView = (user: any) => {
    window.location.href = `/admin/users/${user.id}`
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Page Header */}
        <UsersPageHeader
          onAddUser={handleAddUser}
          onExport={handleExport}
        />

        {/* Statistics */}
        {stats && <UsersStats stats={stats} />}

        {/* Search and Filters */}
        <UsersSearchFilters
          searchTerm={filterState.searchTerm}
          statusFilter={filterState.statusFilter}
          roleFilter={filterState.roleFilter}
          onSearchChange={filterActions.setSearchTerm}
          onStatusChange={filterActions.setStatusFilter}
          onRoleChange={filterActions.setRoleFilter}
          onReset={filterActions.resetFilters}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => userActions.refreshUsers()}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Users Display */}
        {!isLoading && !error && (
          <>
            {isMobile ? (
              <UsersCardView
                users={users}
                onDelete={userActions.deleteUser}
                onBan={userActions.banUser}
                onUnban={userActions.unbanUser}
                onView={handleView}
              />
            ) : (
              <UsersTable
                users={users}
                onDelete={userActions.deleteUser}
                onBan={userActions.banUser}
                onUnban={userActions.unbanUser}
                onView={handleView}
              />
            )}
          </>
        )}

        {/* Pagination and Results Summary */}
        {!isLoading && !error && users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị <span className="font-medium">{users.length}</span> trong{" "}
              <span className="font-medium">{totalUsers}</span> người dùng
            </p>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => filterActions.setPage(filterState.page - 1)}
                disabled={filterState.page === 0}
                className="px-3 py-1 text-sm border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-muted-foreground">
                Trang {filterState.page + 1} / {totalPages}
              </span>
              <button
                onClick={() => filterActions.setPage(filterState.page + 1)}
                disabled={filterState.page >= totalPages - 1}
                className="px-3 py-1 text-sm border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
          </div>
        )}

        {/* Add User Modal */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSubmitNewUser}
        />
      </div>
    </div>
  )
}
