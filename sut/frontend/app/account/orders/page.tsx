"use client";

import { useAuth } from "@/lib/auth-context";
import {
  ordersService,
  OrderResponse,
} from "@/lib/services/orders.service";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Package,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [timeFilter, setTimeFilter] = useState("ALL")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersService.getMyOrders()
      // Sort by newest first
      const sortedData = data.sort((a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
      setOrders(sortedData)
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false
      }

      // 2. Time Filter
      if (timeFilter !== "ALL") {
        const orderDate = new Date(order.orderDate)
        const now = new Date()

        if (timeFilter === "30_DAYS") {
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
          if (orderDate < thirtyDaysAgo) return false
        } else if (timeFilter === "6_MONTHS") {
          const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6))
          if (orderDate < sixMonthsAgo) return false
        } else if (timeFilter === "THIS_YEAR") {
          const startOfYear = new Date(new Date().getFullYear(), 0, 1)
          if (orderDate < startOfYear) return false
        }
      }

      return true
    })
  }

  const filteredOrders = getFilteredOrders()

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700" },
    SHIPPED: { label: "Đang giao", color: "bg-purple-100 text-purple-700" },
    DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
    COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
    ALL: { label: "Tất cả", color: "bg-gray-100 text-gray-700" }
  }

  const filterTabs = [
    { id: "ALL", label: "Tất cả" },
    { id: "PENDING", label: "Chờ xác nhận" },
    { id: "CONFIRMED", label: "Đã xác nhận" },
    { id: "PROCESSING", label: "Đang xử lý" },
    { id: "SHIPPED", label: "Đang giao" },
    { id: "DELIVERED", label: "Đã giao" },
    { id: "COMPLETED", label: "Hoàn thành" },
    { id: "CANCELLED", label: "Đã hủy" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Lịch sử mua hàng</h1>
            <p className="text-muted-foreground">Theo dõi và quản lý đơn hàng của bạn</p>
          </div>

          {/* Filters Section */}
          <div className="space-y-4 mb-8">
            {/* Status Tabs - Scrollable on mobile */}
            <div className="flex overflow-x-auto pb-2 gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time Filter & Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Thời gian:</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ALL">Toàn bộ thời gian</option>
                  <option value="30_DAYS">30 ngày gần đây</option>
                  <option value="6_MONTHS">6 tháng gần đây</option>
                  <option value="THIS_YEAR">Năm nay ({new Date().getFullYear()})</option>
                </select>
              </div>

              <div className="text-sm text-muted-foreground">
                Hiển thị {filteredOrders.length} đơn hàng
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-lg border border-border border-dashed">
              <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">Không tìm thấy đơn hàng nào</p>
              {statusFilter !== "ALL" || timeFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("ALL")
                    setTimeFilter("ALL")
                  }}
                >
                  Xóa bộ lọc
                </Button>
              ) : (
                <Link href="/products">
                  <Button>Mua sắm ngay</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" }
                return (
                  <Link key={order.id} href={`/account/orders/${order.id}`}>
                    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer group">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition">
                              #{order.orderCode || order.id.substring(0, 8)}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Đặt ngày {new Date(order.orderDate).toLocaleDateString("vi-VN", {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">{order.total.toLocaleString("vi-VN")}₫</p>
                          <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 py-4 border-t border-border border-dashed">
                        <div className="flex -space-x-3 overflow-hidden">
                          {order.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="relative inline-block h-10 w-10 rounded-full ring-2 ring-background bg-muted">
                              <img
                                src={item.bookImageUrl || "/placeholder.svg"}
                                alt=""
                                className="h-full w-full object-cover rounded-full"
                              />
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-background bg-muted text-xs font-medium text-muted-foreground">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-foreground">
                          {order.items.length} sản phẩm
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          Nhấn để xem chi tiết
                        </span>
                        <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
