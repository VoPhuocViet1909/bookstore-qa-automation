/**
 * Hook for User Management Page
 * Handles fetching users from API, filtering, and user actions
 */

import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { usersService, UserManagementResponse, UserStatsResponse } from "@/lib/services/users.service"

export interface UserFilterState {
  searchTerm: string
  statusFilter: string
  roleFilter: string
  sortBy: string
  sortDirection: "asc" | "desc"
  page: number
  pageSize: number
}

export interface UserFilterActions {
  setSearchTerm: (value: string) => void
  setStatusFilter: (value: string) => void
  setRoleFilter: (value: string) => void
  setSortBy: (value: string) => void
  setSortDirection: (direction: "asc" | "desc") => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  resetFilters: () => void
}

export interface UserActions {
  deleteUser: (id: string) => Promise<void>
  banUser: (id: string) => Promise<void>
  unbanUser: (id: string) => Promise<void>
  refreshUsers: () => Promise<void>
}

export interface UserManagementState {
  users: UserManagementResponse[]
  stats: UserStatsResponse | null
  filterState: UserFilterState
  filterActions: UserFilterActions
  userActions: UserActions
  isLoading: boolean
  error: string | null
  totalPages: number
  totalUsers: number
}

const initialFilterState: UserFilterState = {
  searchTerm: "",
  statusFilter: "all",
  roleFilter: "all",
  sortBy: "createdAt",
  sortDirection: "desc",
  page: 0,
  pageSize: 10,
}

export function useUserManagement(): UserManagementState {
  // State
  const [users, setUsers] = useState<UserManagementResponse[]>([])
  const [stats, setStats] = useState<UserStatsResponse | null>(null)
  const [filterState, setFilterState] = useState<UserFilterState>(initialFilterState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Map filter state to API params
      const filters: any = {
        page: filterState.page,
        size: filterState.pageSize,
      }

      if (filterState.searchTerm) {
        filters.search = filterState.searchTerm
      }

      if (filterState.statusFilter && filterState.statusFilter !== 'all') {
        filters.status = filterState.statusFilter
      }

      if (filterState.roleFilter && filterState.roleFilter !== 'all') {
        filters.role = filterState.roleFilter.toUpperCase()
      }

      if (filterState.sortBy) {
        filters.sortBy = filterState.sortBy
        filters.sortDirection = filterState.sortDirection
      }

      const response = await usersService.getUsers(filters)

      // Backend trả về: { code: 200, message: "...", result: Page<UserManagementResponse> }
      // result = { content: [], totalPages, totalElements, ... }
      const apiResponse = response as any

      if (apiResponse?.result) {
        // Backend response structure: {code, message, result}
        const pageData = apiResponse.result
        setUsers(pageData.content || [])
        setTotalPages(pageData.totalPages || 0)
        setTotalUsers(pageData.totalElements || 0)
      } else if (apiResponse?.data?.data) {
        // Alternative structure: {data: {data: Page}}
        const pageData = apiResponse.data.data
        setUsers(pageData.content || [])
        setTotalPages(pageData.totalPages || 0)
        setTotalUsers(pageData.totalElements || 0)
      } else if (apiResponse?.content) {
        // Direct Page response
        setUsers(apiResponse.content || [])
        setTotalPages(apiResponse.totalPages || 0)
        setTotalUsers(apiResponse.totalElements || 0)
      } else {
        setUsers([])
        setTotalPages(0)
        setTotalUsers(0)
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng')
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }, [filterState])

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await usersService.getUserStatistics()

      // Backend trả về: { code: 200, message: "...", result: UserStatsResponse }
      const apiResponse = response as any
      let stats = null

      if (apiResponse?.result) {
        // Backend structure: {code, message, result}
        stats = apiResponse.result
      } else if (apiResponse?.data) {
        // Alternative: {data: UserStatsResponse}
        stats = apiResponse.data
      } else if (apiResponse && typeof apiResponse.totalUsers !== 'undefined') {
        // Direct UserStatsResponse
        stats = apiResponse
      }

      // Validate stats has required fields
      if (stats && typeof stats.totalUsers !== 'undefined') {
        setStats(stats)
      } else {
        // Set default stats as fallback
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          bannedUsers: 0,
          totalAdmins: 0,
          totalCustomers: 0,
          totalGuests: 0,
          totalRevenue: 0,
          avgRevenuePerUser: 0,
          avgOrderValue: 0,
          totalOrders: 0,
          newUsersThisMonth: 0,
          newUsersThisWeek: 0,
          newUsersToday: 0,
          topSpenders: [],
          topBuyers: []
        })
      }
    } catch (err: any) {
      // Set default stats on error to prevent crashes
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        bannedUsers: 0,
        totalAdmins: 0,
        totalCustomers: 0,
        totalGuests: 0,
        totalRevenue: 0,
        avgRevenuePerUser: 0,
        avgOrderValue: 0,
        totalOrders: 0,
        newUsersThisMonth: 0,
        newUsersThisWeek: 0,
        newUsersToday: 0,
        topSpenders: [],
        topBuyers: []
      })
    }
  }, [])

  // Load users when filter changes
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Load statistics on mount
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  // Filter Actions
  const filterActions: UserFilterActions = useMemo(() => ({
    setSearchTerm: (value: string) => {
      setFilterState(prev => ({ ...prev, searchTerm: value, page: 0 }))
    },
    setStatusFilter: (value: string) => {
      setFilterState(prev => ({ ...prev, statusFilter: value, page: 0 }))
    },
    setRoleFilter: (value: string) => {
      setFilterState(prev => ({ ...prev, roleFilter: value, page: 0 }))
    },
    setSortBy: (value: string) => {
      setFilterState(prev => ({ ...prev, sortBy: value, page: 0 }))
    },
    setSortDirection: (direction: "asc" | "desc") => {
      setFilterState(prev => ({ ...prev, sortDirection: direction, page: 0 }))
    },
    setPage: (page: number) => {
      setFilterState(prev => ({ ...prev, page }))
    },
    setPageSize: (size: number) => {
      setFilterState(prev => ({ ...prev, pageSize: size, page: 0 }))
    },
    resetFilters: () => {
      setFilterState(initialFilterState)
    },
  }), [])

  // User Actions
  const userActions: UserActions = useMemo(() => ({
    deleteUser: async (id: string) => {
      try {
        await usersService.deleteUser(id)
        toast.success('Đã xóa người dùng thành công')
        // Refresh users after delete
        await fetchUsers()
        await fetchStatistics()
      } catch (err: any) {
        toast.error(err.message || 'Không thể xóa người dùng')
        throw err
      }
    },

    banUser: async (id: string) => {
      try {
        await usersService.banUser(id)
        toast.success('Đã cấm người dùng thành công')
        // Refresh users after ban
        await fetchUsers()
        await fetchStatistics()
      } catch (err: any) {
        toast.error(err.message || 'Không thể cấm người dùng')
        throw err
      }
    },

    unbanUser: async (id: string) => {
      try {
        await usersService.unbanUser(id)
        toast.success('Đã bỏ cấm người dùng thành công')
        // Refresh users after unban
        await fetchUsers()
        await fetchStatistics()
      } catch (err: any) {
        toast.error(err.message || 'Không thể bỏ cấm người dùng')
        throw err
      }
    },

    refreshUsers: async () => {
      await fetchUsers()
      await fetchStatistics()
    },
  }), [fetchUsers, fetchStatistics])

  return {
    users,
    stats,
    filterState,
    filterActions,
    userActions,
    isLoading,
    error,
    totalPages,
    totalUsers,
  }
}
