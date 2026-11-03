"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { cartService, type Cart, type AddToCartResponse, type UpdateCartResponse, type RemoveCartResponse } from "@/lib/services/cart.service"
import { useAuth } from "./auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, usePathname } from "next/navigation"

interface CartContextType {
  cart: Cart | null
  itemCount: number
  isOpen: boolean
  selectedItems: string[]
  toggleItemSelection: (bookId: string) => void
  selectAll: (selected: boolean) => void
  loading: boolean
  addToCart: (bookId: string, quantity?: number) => Promise<void>
  updateQuantity: (bookId: string, quantity: number) => Promise<void>
  removeItem: (bookId: string) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
  toggleCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [itemCount, setItemCount] = useState(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  // Load cart when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      loadCart()
    } else {
      setCart(null)
      setItemCount(0)
      setSelectedItems([])
    }
  }, [isAuthenticated])

  const loadCart = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const cartData = await cartService.getCart()
      setCart(cartData)
      setItemCount(cartData.itemCount || 0)
      // By default select all items
      if (cartData && cartData.items) {
        setSelectedItems(cartData.items.map(item => item.bookId))
      }
    } catch (error: any) {
      console.error("Failed to load cart:", error)
      // Don't show error toast for initial load, just log it
    } finally {
      setLoading(false)
    }
  }

  const toggleItemSelection = (bookId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(bookId)) {
        return prev.filter(id => id !== bookId)
      } else {
        return [...prev, bookId]
      }
    })
  }

  const selectAll = (selected: boolean) => {
    if (selected && cart?.items) {
      setSelectedItems(cart.items.map(item => item.bookId))
    } else {
      setSelectedItems([])
    }
  }

  const addToCart = async (bookId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    try {
      setLoading(true)
      const response: AddToCartResponse = await cartService.addToCart({ bookId, quantity })

      // Reload cart to get updated state
      await loadCart()

      // Add the new item to selection if it's not already there (though loadCart selects all, this ensures it)
      setSelectedItems(prev => prev.includes(bookId) ? prev : [...prev, bookId])

      toast({
        title: "Đã thêm vào giỏ hàng",
        description: "Sản phẩm đã được thêm vào giỏ hàng thành công",
      })

      // Open cart sidebar to show the added item
      setIsOpen(true)
    } catch (error: any) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (bookId: string, quantity: number) => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response: UpdateCartResponse = await cartService.updateCartItem(bookId, { quantity })

      // Reload cart to get updated state
      await loadCart()

      toast({
        title: "Đã cập nhật",
        description: "Số lượng sản phẩm đã được cập nhật",
      })
    } catch (error: any) {
      console.error("Failed to update quantity:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật số lượng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (bookId: string) => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response: RemoveCartResponse = await cartService.removeCartItem(bookId)

      // Reload cart to get updated state
      await loadCart()

      // Remove from selection
      setSelectedItems(prev => prev.filter(id => id !== bookId))

      toast({
        title: "Đã xóa",
        description: "Sản phẩm đã được xóa khỏi giỏ hàng",
      })
    } catch (error: any) {
      console.error("Failed to remove item:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa sản phẩm",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      await cartService.clearCart()

      setCart(null)
      setItemCount(0)
      setSelectedItems([])

      toast({
        title: "Đã xóa giỏ hàng",
        description: "Tất cả sản phẩm đã được xóa khỏi giỏ hàng",
      })
    } catch (error: any) {
      console.error("Failed to clear cart:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa giỏ hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleCart = () => setIsOpen(!isOpen)
  const closeCart = () => setIsOpen(false)

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        selectedItems,
        toggleItemSelection,
        selectAll,
        isOpen,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        loadCart,
        toggleCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
