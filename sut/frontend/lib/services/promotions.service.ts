/**
 * Promotions Service
 * Handles all promotion/discount-related API calls
 */

import { apiClient, PaginatedResponse } from "../api-client"

// Backend API Response format
interface BackendApiResponse<T> {
  code: number
  message: string
  result: T
}

// Spring Page format from backend
interface SpringPage<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// Backend Promotion Response format
export interface BackendPromotionResponse {
  promotionID: string
  name: string
  code: string
  discountPercent: number
  startDate: string
  endDate: string
  description?: string
  usageCount: number
  usageLimit: number
  status: "ACTIVE" | "INACTIVE" | "EXPIRED"
  applicableBookIds?: string[]
  isValid?: boolean
}

// Frontend Promotion format
export interface Promotion {
  id: string
  code: string
  name: string
  description?: string
  discount: number // discountPercent from backend
  active: boolean // status === "ACTIVE"
  startDate: string
  endDate: string
  usageLimit: number
  usageCount: number
  status: "ACTIVE" | "INACTIVE" | "EXPIRED"
  applicableBookIds?: string[]
}

export interface CreatePromotionRequest {
  code: string
  name: string
  description?: string
  discountPercent: number
  startDate: string
  endDate: string
  usageLimit: number
  applicableBookIds?: string[]
}

export interface UpdatePromotionRequest {
  name?: string
  description?: string
  discountPercent?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  applicableBookIds?: string[]
}

export interface PromotionFilters {
  page?: number
  size?: number
}

// Transform backend response to frontend format
function transformPromotion(backend: BackendPromotionResponse): Promotion {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day
  const startDate = new Date(backend.startDate)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(backend.endDate)
  endDate.setHours(0, 0, 0, 0)

  let status = backend.status

  // Nếu startDate > today, tự động set INACTIVE (chưa đến ngày áp dụng)
  if (startDate > today && status === "ACTIVE") {
    status = "INACTIVE"
  }

  // Nếu endDate < today, tự động set EXPIRED
  if (endDate < today && status !== "EXPIRED") {
    status = "EXPIRED"
  }

  return {
    id: backend.promotionID,
    code: backend.code,
    name: backend.name,
    description: backend.description,
    discount: backend.discountPercent,
    active: status === "ACTIVE",
    startDate: backend.startDate,
    endDate: backend.endDate,
    usageLimit: backend.usageLimit,
    usageCount: backend.usageCount,
    status: status,
    applicableBookIds: backend.applicableBookIds,
  }
}

// Transform Spring Page to PaginatedResponse
function transformPage<T, R>(
  springPage: SpringPage<T>,
  transformer: (item: T) => R
): PaginatedResponse<R> {
  return {
    data: springPage.content.map(transformer),
    page: springPage.page,
    pageSize: springPage.size,
    totalItems: springPage.totalElements,
    totalPages: springPage.totalPages,
  }
}

export const promotionsService = {
  /**
   * Get paginated list of promotions (Admin only)
   */
  async getPromotions(filters?: PromotionFilters): Promise<PaginatedResponse<Promotion>> {
    // apiClient.get đã unwrap result rồi, nên response là SpringPage chứ không phải BackendApiResponse
    const response = await apiClient.get<SpringPage<BackendPromotionResponse>>(
      "/promotions",
      filters
    )
    return transformPage(response, transformPromotion)
  },

  /**
   * Get active promotions
   */
  async getActivePromotions(): Promise<Promotion[]> {
    // apiClient.get đã unwrap result rồi
    const response = await apiClient.get<BackendPromotionResponse[]>(
      "/promotions/active"
    )
    return response.map(transformPromotion)
  },

  /**
   * Get a single promotion by ID
   */
  async getPromotionById(id: string): Promise<Promotion> {
    // apiClient.get đã unwrap result rồi
    const response = await apiClient.get<BackendPromotionResponse>(
      `/promotions/${id}`
    )
    return transformPromotion(response)
  },

  /**
   * Validate a promotion code
   */
  async validatePromotion(code: string, orderTotal: number, bookIds?: string[]): Promise<{
    valid: boolean
    promotion?: Promotion
    discount: number
    message?: string
  }> {
    // apiClient.post đã unwrap result rồi
    const response = await apiClient.post<any>("/promotions/validate", {
      code: code,
      orderValue: orderTotal,
      bookIds: bookIds || [],
    })
    // Transform validation response
    return {
      valid: response.isValid || false,
      discount: response.discountAmount || 0,
      message: response.message,
    }
  },

  /**
   * Create a new promotion (Admin only)
   */
  async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
    // apiClient.post đã unwrap result rồi
    console.log("Sending create promotion request:", JSON.stringify(data, null, 2))
    const response = await apiClient.post<BackendPromotionResponse>(
      "/promotions",
      data
    )
    return transformPromotion(response)
  },

  /**
   * Update a promotion (Admin only)
   */
  async updatePromotion(id: string, data: UpdatePromotionRequest): Promise<Promotion> {
    // apiClient.put đã unwrap result rồi
    const response = await apiClient.put<BackendPromotionResponse>(
      `/promotions/${id}`,
      data
    )
    return transformPromotion(response)
  },

  /**
   * Delete a promotion (Admin only)
   */
  async deletePromotion(id: string): Promise<void> {
    await apiClient.delete<BackendApiResponse<void>>(`/promotions/${id}`)
  },

  /**
   * Update promotion status (Admin only)
   */
  async updatePromotionStatus(id: string, status: "ACTIVE" | "INACTIVE" | "EXPIRED"): Promise<Promotion> {
    // apiClient.patch đã unwrap result rồi
    const response = await apiClient.patch<BackendPromotionResponse>(
      `/promotions/${id}/status?status=${status}`,
      {}
    )
    return transformPromotion(response)
  },
}
