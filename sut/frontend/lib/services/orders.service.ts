/**
 * Orders Service
 * Handles all order-related API calls matching the backend OrderController
 */

import { apiClient } from "../api-client"

// --- DTO Interfaces ---



export interface OrderItemResponse {
  id: string
  bookId: string
  bookTitle: string
  bookIsbn: string
  bookImageUrl: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "COMPLETED"

export interface OrderResponse {
  id: string
  orderCode: string
  orderDate: string // LocalDateTime
  status: OrderStatus
  subtotal: number
  total: number
  paymentMethod: string
  taxAmount: number
  shippingFee: number

  // Promotion info
  promotionCode?: string
  promotionName?: string
  discountPercent?: number
  discountAmount?: number

  // Customer info
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerMembershipTier: string

  // Shipping info (Flattened)
  recipientName?: string
  recipientPhone?: string
  shippingAddress?: string // fullAddress
  shippingProvince?: string
  shippingDistrict?: string
  shippingWard?: string
  shippingNote?: string

  items: OrderItemResponse[]
  note?: string
}

export interface CheckoutRequest {
  addressId: string
  paymentMethod: string // "COD", "VNPay", "ZaloPay", "MoMo"
  note?: string
  discountCode?: string
  bookIds?: string[] // If null/empty -> checkout all cart
  redirectUrl?: string // URL to redirect back after payment
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

export interface PaymentResponse {
  paymentId: string
  orderId: string
  paymentMethod: string
  amount: number
  paymentDate: string
  status: PaymentStatus
}

export interface CreatePaymentResponse {
  code: string
  message: string
  paymentUrl: string
  payment: PaymentResponse
}

// Spring Data Page interface
export interface Page<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number // current page index (0-based)
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// --- Service Implementation ---

export const ordersService = {
  /**
   * Get list of orders for the current logged-in user
   * GET /api/orders
   */
  async getMyOrders(): Promise<OrderResponse[]> {
    return apiClient.get<OrderResponse[]>("/orders")
  },

  /**
   * Get order details by ID
   * GET /api/orders/{orderId}
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    return apiClient.get<OrderResponse>(`/orders/${orderId}`)
  },

  /**
   * Cancel an order
   * POST /api/orders/{orderId}/cancel
   */
  async cancelOrder(orderId: string): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>(`/orders/${orderId}/cancel`)
  },

  /**
   * ADMIN: Get all orders with pagination
   * GET /api/orders/admin/all?page=0&size=10
   */
  async getAllOrders(page: number = 0, size: number = 10): Promise<Page<OrderResponse>> {
    return apiClient.get<Page<OrderResponse>>("/orders/admin/all", { page, size })
  },
  /**
   * ADMIN: Update order status
   * PUT /api/orders/admin/{orderId}/status?status=CONFIRMED
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderResponse> {
    return apiClient.put<OrderResponse>(`/orders/admin/${orderId}/status?status=${status}`)
  },

  /**
   * ADMIN: Get orders by status
   * GET /api/orders/admin/status/{status}?startDate=2024-01-01&endDate=2024-01-31
   */
  async getOrdersByStatus(status: OrderStatus, startDate?: string, endDate?: string): Promise<OrderResponse[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return apiClient.get<OrderResponse[]>(`/orders/admin/status/${status}${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * ADMIN: Get total revenue
   * GET /api/orders/admin/revenue?startDate=2024-01-01&endDate=2024-01-31
   */
  async getTotalRevenue(startDate?: string, endDate?: string): Promise<number> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return apiClient.get<number>(`/orders/admin/revenue${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Count orders of current user
   * GET /api/orders/count
   */
  async countMyOrders(): Promise<number> {
    return apiClient.get<number>("/orders/count")
  },

  /**
   * Checkout (COD)
   * POST /api/orders/checkout
   */
  async checkout(data: CheckoutRequest): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>("/orders/checkout", data)
  },

  /**
   * Checkout with VNPay
   * POST /api/orders/checkout/vnpay
   */
  async checkoutVNPay(data: CheckoutRequest): Promise<CreatePaymentResponse> {
    return apiClient.post<CreatePaymentResponse>("/orders/checkout/vnpay", data)
  },

  /**
   * Checkout with ZaloPay
   * POST /api/orders/checkout/zalopay
   */
  async checkoutZaloPay(data: CheckoutRequest): Promise<CreatePaymentResponse> {
    return apiClient.post<CreatePaymentResponse>("/orders/checkout/zalopay", data)
  },

  /**
   * Checkout with MoMo
   * POST /api/orders/checkout/momo
   */
  async checkoutMoMo(data: CheckoutRequest): Promise<CreatePaymentResponse> {
    return apiClient.post<CreatePaymentResponse>("/orders/checkout/momo", data)
  },

  /**
   * Verify MoMo Payment (Callback)
   * POST /api/payment/momo/callback
   */
  async verifyMoMoPayment(data: MoMoCallbackRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>("/payment/momo/callback", data)
  },
}

export interface MoMoCallbackRequest {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: string
  resultCode: number
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}
