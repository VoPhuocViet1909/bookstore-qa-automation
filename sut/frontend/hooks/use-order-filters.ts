import { useMemo, useState } from "react"
import { OrderResponse } from "@/lib/services/orders.service"

export interface OrderFilterState {
  searchTerm: string
  activeStatus: string
  channel: string
}

export interface OrderFilterActions {
  setSearchTerm: (value: string) => void
  setActiveStatus: (value: string) => void
  setChannel: (value: string) => void
  resetFilters: () => void
}

export function useOrderFilters(orders: OrderResponse[]) {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [activeStatus, setActiveStatus] = useState("ALL")
  const [channel, setChannel] = useState("ALL")

  // Status options
  const statusOptions = useMemo(() =>
    ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "COMPLETED"], []
  )

  // Channel options  
  const channelOptions = useMemo(() =>
    ["ALL", "Website", "Store"], []
  )

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderCode && order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = activeStatus === "ALL" || order.status === activeStatus
      // Assuming all orders are from Website for now as we don't have channel in OrderResponse
      const matchesChannel = channel === "ALL" || channel === "Website"

      return matchesSearch && matchesStatus && matchesChannel
    })
  }, [searchTerm, activeStatus, channel, orders])

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setActiveStatus("ALL")
    setChannel("ALL")
  }

  return {
    filterState: {
      searchTerm,
      activeStatus,
      channel,
    },
    filteredOrders,
    statusOptions,
    channelOptions,
    actions: {
      setSearchTerm,
      setActiveStatus,
      setChannel,
      resetFilters,
    },
  }
}