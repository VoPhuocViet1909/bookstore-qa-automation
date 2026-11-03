/**
 * Wishlist Service
 * Handles all wishlist-related API calls
 */

import { apiClient } from "../api-client"

export interface WishlistBook {
  id: string
  title: string
  price: number
  discountPrice: number
  mainImageUrl: string | null
  averageRating: number
  reviewCount: number
  stockQuantity: number
  authorNames: string[]
  categoryId: string[]
}

export interface Wishlist {
  wishlistId: string
  userId: string
  createdAt: string
  books: WishlistBook[]
}

export interface WishlistResponse {
  code: number
  result: Wishlist
}

export interface AddToWishlistRequest {
  bookId: string
}

export interface CheckWishlistResponse {
  code: number
  result: {
    bookId: string
    inWishlist: boolean
  }
}

export const wishlistService = {
  /**
   * Get user's wishlist
   */
  async getWishlist(): Promise<Wishlist> {
    const response = await apiClient.get<Wishlist>("/wishlist")
    return response
  },

  /**
   * Add a book to wishlist
   */
  async addToWishlist(bookId: string): Promise<Wishlist> {
    console.log("[Wishlist Service] Adding book to wishlist:", bookId)
    try {
      const response = await apiClient.post<Wishlist>("/wishlist/add", { bookId })
      console.log("[Wishlist Service] Add successful:", response)
      return response
    } catch (error: any) {
      console.log("[Wishlist Service] Add error:", error)
      // If book already in wishlist (code 4001), fetch current wishlist
      if (error?.code === 4001) {
        console.log("[Wishlist Service] Book already in wishlist, fetching current state")
        const wishlist = await this.getWishlist()
        console.log("[Wishlist Service] Fetched wishlist:", wishlist)
        return wishlist
      }
      throw error
    }
  },

  /**
   * Remove a book from wishlist
   */
  async removeFromWishlist(bookId: string): Promise<void> {
    console.log("[Wishlist Service] Removing book from wishlist:", bookId)
    const result = await apiClient.delete<void>(`/wishlist/remove/${bookId}`)
    console.log("[Wishlist Service] Remove successful")
    return result
  },

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<void> {
    return apiClient.delete<void>("/wishlist/clear")
  },

  /**
   * Check if a book is in wishlist
   */
  async checkWishlist(bookId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<CheckWishlistResponse>(`/wishlist/check/${bookId}`)
      console.log("[Wishlist Service] Check response:", response)
      // apiClient already unwraps the result, so response is the result object
      return (response as any).inWishlist || false
    } catch (error) {
      console.error("[Wishlist Service] Check error:", error)
      return false
    }
  },

  /**
   * Check if a book is in wishlist (legacy method)
   */
  async isInWishlist(bookId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist()
      return wishlist.books.some(book => book.id === bookId)
    } catch (error) {
      return false
    }
  },
}
