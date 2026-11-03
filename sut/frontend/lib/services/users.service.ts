/**
 * Users Service
 * Handles all user-related API calls for Admin User Management
 */
import { apiClient, PaginatedResponse } from "../api-client";
import { Address } from "./address.service";

// User Management Response từ Backend (UserManagementResponse.java)
export interface UserManagementResponse {
  id: string
  username: string
  email: string
  fullName: string
  phoneNumber: string
  avatarUrl?: string
  role: string // ADMIN, CUSTOMER, GUEST
  status: string // active, inactive, banned
  dateOfBirth?: string
  points: number
  membershipTier: string // BRONZE, SILVER, GOLD, PLATINUM
  isEmailVerified: boolean
  createdAt: string
  lastLogin?: string
  totalOrders: number
  totalSpent: number
}

// User Detail Response từ Backend (UserDetailResponse.java)
export interface UserDetailResponse extends UserManagementResponse {
  totalReviews: number
  lastOrderDate?: string
  addresses: UserAddress[]
}

export interface UserAddress {
  id: string
  recipientName: string
  phoneNumber: string
  street: string
  ward: string
  district: string
  province: string
  latitude?: number
  longitude?: number
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string | null;
  avatar?: string;
  avatarUrl?: string; // Google avatar URL
  role: "user" | "admin" | "CUSTOMER" | "ADMIN";
  status?: "active" | "inactive" | "banned";
  emailVerified?: boolean;
  addresses?: Address[];
  totalOrders?: number;
  totalSpent?: number;
  dateOfBirth?: string | null;
  gender?: string | null;
  lastLogin?: string | null;
  membershipTier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  points?: number;
  providerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  avatar?: File;
  gender?: string; // Male, Female, Other
  dateOfBirth?: string; // yyyy-MM-dd
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User Filter Request khớp với Backend
export interface UserFilters {
  page?: number
  size?: number  // Backend dùng 'size' thay vì 'pageSize'
  search?: string
  role?: string  // ADMIN, CUSTOMER, GUEST
  status?: string // active, inactive, banned
  sortBy?: string // username, createdAt, totalOrders, totalSpent
  sortDirection?: "asc" | "desc" // Backend dùng 'sortDirection'
}

// Statistics Response từ Backend
export interface UserStatsResponse {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  bannedUsers: number
  totalAdmins: number
  totalCustomers: number
  totalGuests: number
  totalRevenue: number
  avgRevenuePerUser: number
  avgOrderValue: number
  totalOrders: number
  newUsersThisMonth: number
  newUsersThisWeek: number
  newUsersToday: number
  topSpenders: TopUserResponse[]
  topBuyers: TopUserResponse[]
}

export interface TopUserResponse {
  userId: string
  username: string
  email: string
  fullName: string
  totalOrders: number
  totalSpent: number
}

// Create User Request (matches CreateUserRequest.java)
export interface CreateUserRequest {
  username: string
  password: string
  email: string
  fullName: string
  phoneNumber?: string
  gender?: string // Male, Female, Other
  avatarUrl?: string
  dateOfBirth?: string // ISO date string
  role?: string // GUEST, CUSTOMER, ADMIN (default: CUSTOMER)
}

export const usersService = {
  /**
   * Get paginated list of users with filters (Admin only)
   * GET /api/admin/users
   */
  async getUsers(
    filters?: UserFilters
  ): Promise<PaginatedResponse<UserManagementResponse>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.status) params.append("status", filters.status);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortDirection)
        params.append("sortDirection", filters.sortDirection);
      if (filters.page !== undefined)
        params.append("page", filters.page.toString());
      if (filters.size !== undefined)
        params.append("size", filters.size.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/admin/users?${queryString}`
      : `/admin/users`;

    return apiClient.get<PaginatedResponse<UserManagementResponse>>(endpoint);
  },

  //   /**
  //    * Get a single user by ID (Admin only)
  //    */
  //   async getUserById(id: string): Promise<User> {
  //     return apiClient.get<User>(`/users/${id}`);
  //   },

  /**
   * Get current user profile
   */
  async getMyProfile(): Promise<User> {
    return apiClient.get<User>("/users/me");
  },

  /**
   * Get user detail by ID (Admin only)
   * GET /api/admin/users/{id}
   */
  async getUserById(id: string): Promise<UserDetailResponse> {
    return apiClient.get<UserDetailResponse>(`/admin/users/${id}`)
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const formData = new FormData();
    if (data.fullName) formData.append("fullName", data.fullName);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.gender) formData.append("gender", data.gender);
    if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);
    if (data.avatar) formData.append("avatar", data.avatar);

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    // Use fetch directly for FormData to avoid Content-Type issues with axios/apiClient wrapper if any
    // Assuming apiClient handles simple JSON. For FormData, it's safer to use fetch or configure apiClient to not set Content-Type
    // But let's check apiClient implementation first? 
    // Actually, looking at `uploadAvatar` implementation in this file (lines 270+), it uses native fetch.
    // I should probably follow that pattern for consistency and safety with FormData.

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set Content-Type header, browser sets it with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Title update failed (HTTP ${response.status})`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Không thể cập nhật thông tin');
    }
  },

  /**
   * Delete user (Admin only)
   * DELETE /api/admin/users/{id}
   */
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/users/${id}`)
  },

  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/users/change-password", data);
  },

  /**
   * Ban user (Admin only)
   * PATCH /api/admin/users/{id}/ban
   */
  async banUser(id: string): Promise<UserManagementResponse> {
    return apiClient.patch<UserManagementResponse>(`/admin/users/${id}/ban`, {})
  },

  /**
   * Unban user (Admin only)
   * PATCH /api/admin/users/{id}/unban
   */
  async unbanUser(id: string): Promise<UserManagementResponse> {
    return apiClient.patch<UserManagementResponse>(`/admin/users/${id}/unban`, {})
  },

  /**
   * Update user status (Admin only)
   * PATCH /api/admin/users/{id}/status
   */
  async updateUserStatus(id: string, status: string): Promise<UserManagementResponse> {
    return apiClient.patch<UserManagementResponse>(`/admin/users/${id}/status`, { status })
  },

  /**
   * Get user statistics (Admin only)
   * GET /api/admin/users/statistics?startDate=2024-01-01&endDate=2024-01-31
   */
  async getUserStatistics(startDate?: string, endDate?: string): Promise<UserStatsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return apiClient.get<UserStatsResponse>(`/admin/users/statistics${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get top spenders (Admin only)
   * GET /api/admin/users/top-spenders?limit=10
   */
  async getTopSpenders(limit: number = 10): Promise<TopUserResponse[]> {
    return apiClient.get<TopUserResponse[]>(`/admin/users/top-spenders?limit=${limit}`)
  },

  /**
   * Get top buyers (Admin only)
   * GET /api/admin/users/top-buyers?limit=10
   */
  async getTopBuyers(limit: number = 10): Promise<TopUserResponse[]> {
    return apiClient.get<TopUserResponse[]>(`/admin/users/top-buyers?limit=${limit}`)
  },

  /**
   * Create a new user (Admin only)
   * POST /api/admin/users
   */
  async createUser(userData: CreateUserRequest): Promise<UserManagementResponse> {
    return apiClient.post<UserManagementResponse>('/admin/users', userData)
  },

  //   async updateUserStatus(id: string, status: User["status"]): Promise<User> {
  //     return apiClient.patch<User>(`/users/${id}/status`, { status });
  //   },

  /**
   * Upload avatar image (Admin only)
   * POST /api/admin/upload/avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Upload failed (HTTP ${response.status})`)
      }

      const data = await response.json()
      // Backend returns: {code: 1000, message: "...", result: "url"}
      return data.result
    } catch (error: any) {
      throw new Error(error.message || 'Không thể upload avatar')
    }
  },

  async updateUserRole(id: string, role: User["role"]): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/role`, { role });
  },

  /**
   * Export users to Excel (Admin only)
   * GET /api/admin/users/export
   */
  async exportUsers(): Promise<Blob> {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/admin/users/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      })

      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP Error ${response.status}`)
        }
        throw new Error(`Không thể xuất dữ liệu (HTTP ${response.status})`)
      }

      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error('File xuất ra rỗng')
      }

      return blob
    } catch (error: any) {
      throw new Error(error.message || 'Không thể xuất dữ liệu người dùng')
    }
  },

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    topSpenders: User[];
  }> {
    return apiClient.get("/users/stats");
  },
};
