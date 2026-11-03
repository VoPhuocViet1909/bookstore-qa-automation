/**
 * Reviews Service
 * Handles all book review-related API calls
 */

import { apiClient, PaginatedResponse } from "../api-client"

export interface Review {
  reviewID: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  isVerifiedPurchase: boolean
  createdAt: string
}

export interface CreateReviewRequest {
  bookId: string
  rating: number
  comment: string
}

export interface ReviewFilters {
  page?: number
  pageSize?: number
  bookId?: string
  userId?: string
  rating?: number
  sortBy?: "createdAt" | "helpful" | "rating"
  sortOrder?: "asc" | "desc"
}

export const reviewsService = {
  /**
   * Get paginated list of reviews
   */
  async getReviews(filters?: ReviewFilters): Promise<PaginatedResponse<Review>> {
    return apiClient.get<PaginatedResponse<Review>>("/reviews", filters)
  },

  /**
   * Get reviews for a specific book
   */
  async getBookReviews(bookId: string, filters?: Omit<ReviewFilters, "bookId">): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<{
      content: Review[]
      totalElements: number
      totalPages: number
      size: number
      number: number
    }>(`/review/book/${bookId}`, filters)

    // apiClient already unwraps the result
    return {
      content: response.content || [],
      currentPage: response.number || 0,
      totalPages: response.totalPages || 0,
      totalElements: response.totalElements || 0,
    }
  },

  /**
   * Get current user's reviews
   */
  async getMyReviews(filters?: Omit<ReviewFilters, "userId">): Promise<PaginatedResponse<Review>> {
    return apiClient.get<PaginatedResponse<Review>>("/reviews/my-reviews", filters)
  },

  /**
   * Create a new review
   */
  async createReview(data: CreateReviewRequest): Promise<Review> {
    return apiClient.post<Review>("/review/book/add", data)
  },

  /**
   * Update a review
   */
  async updateReview(id: string, data: Partial<Omit<CreateReviewRequest, "bookId">>): Promise<Review> {
    return apiClient.put<Review>(`/reviews/${id}`, data)
  },

  /**
   * Delete a review
   */
  async deleteReview(id: string): Promise<void> {
    return apiClient.delete<void>(`/reviews/${id}`)
  },

  /**
   * Mark a review as helpful
   */
  async markHelpful(id: string): Promise<Review> {
    return apiClient.post<Review>(`/reviews/${id}/helpful`, {})
  },

  /**
   * Get book rating summary
   */
  async getBookRatingSummary(bookId: string): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: {
      1: number
      2: number
      3: number
      4: number
      5: number
    }
  }> {
    return apiClient.get(`/reviews/book/${bookId}/summary`)
  },
}
