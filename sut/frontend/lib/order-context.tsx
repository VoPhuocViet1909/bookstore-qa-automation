"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Book } from "./types"

export interface OrderItem {
  book: Book
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    district: string
    ward: string
  }
  paymentMethod: "cod" | "card"
  createdAt: string
  updatedAt: string
  trackingNumber?: string
  estimatedDelivery?: string
}

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => void
  getOrderById: (id: string) => Order | undefined
  getUserOrders: (userId: string) => Order[]
  updateOrderStatus: (id: string, status: Order["status"]) => void
}

const OrderContext = createContext<OrderContextType | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      userId: "1",
      items: [],
      subtotal: 450000,
      shipping: 0,
      total: 450000,
      status: "delivered",
      shippingAddress: {
        fullName: "Nguyễn Văn A",
        phone: "0123456789",
        address: "123 Đường ABC",
        city: "Hà Nội",
        district: "Ba Đình",
        ward: "Phúc Tạn",
      },
      paymentMethod: "cod",
      createdAt: "2024-11-05",
      updatedAt: "2024-11-10",
      trackingNumber: "VN123456789",
      estimatedDelivery: "2024-11-10",
    },
    {
      id: "ORD-002",
      userId: "1",
      items: [],
      subtotal: 320000,
      shipping: 0,
      total: 320000,
      status: "shipped",
      shippingAddress: {
        fullName: "Nguyễn Văn A",
        phone: "0123456789",
        address: "123 Đường ABC",
        city: "Hà Nội",
        district: "Ba Đình",
        ward: "Phúc Tạn",
      },
      paymentMethod: "cod",
      createdAt: "2024-11-08",
      updatedAt: "2024-11-11",
      trackingNumber: "VN123456790",
      estimatedDelivery: "2024-11-12",
    },
  ])

  const addOrder = (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setOrders([...orders, newOrder])
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId)
  }

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders(
      orders.map((order) => (order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order)),
    )
  }

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrderById, getUserOrders, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider")
  }
  return context
}
