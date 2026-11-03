"use client"

import { useOrderFilters } from "@/hooks/use-order-filters"
import {
  OrdersPageHeader,
  OrdersStats,
  OrdersFilterSection,
  OrdersTable
} from "@/components/admin"
import { ordersService, OrderResponse } from "@/lib/services/orders.service"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersService.getAllOrders(0, 100) // Fetching first 100 orders for now
      setOrders(data.content)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Không thể tải danh sách đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  const { filterState, filteredOrders, statusOptions, channelOptions, actions } = useOrderFilters(orders)

  // Handler functions - có thể assign cho từng developer khác nhau
  const handleExportReport = () => {
    // Developer A: Implement export report logic
    console.log('Export report')
  }

  const handleDateReport = () => {
    // Developer B: Implement date report logic  
    console.log('Date report')
  }

  const handleAdvancedFilter = () => {
    // Developer C: Implement advanced filter logic
    console.log('Advanced filter')
  }

  const handleOrderClick = (orderId: string) => {
    // Developer D: Implement order detail view logic
    console.log('Order detail:', orderId)
    // TODO: Navigate to detail
  }

  const handleApproveOrder = async (orderId: string) => {
    try {
      await ordersService.updateOrderStatus(orderId, "PROCESSING")
      toast.success("Đã duyệt đơn hàng thành công")
      fetchOrders() // Refresh list
    } catch (error) {
      console.error("Failed to approve order:", error)
      toast.error("Không thể duyệt đơn hàng")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-6 sm:space-y-8 px-4 py-6 sm:p-6 lg:p-8">

        <OrdersPageHeader
          onExportReport={handleExportReport}
          onDateReport={handleDateReport}
        />

        <OrdersStats />

        <OrdersFilterSection
          filterState={filterState}
          actions={actions}
          statusOptions={statusOptions}
          channelOptions={channelOptions}
          filteredCount={filteredOrders.length}
          totalCount={orders.length}
          onAdvancedFilter={handleAdvancedFilter}
        />

        <OrdersTable
          orders={filteredOrders}
          onOrderClick={handleOrderClick}
          onApproveOrder={handleApproveOrder}
        />

      </div>
    </div>
  )
}

