"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BookOpenCheck, ShoppingCart, Users, DollarSign, TrendingUp, Target, Loader2 } from "lucide-react"
import { dashboardService } from "@/lib/services/dashboard.service"
import type {
  DashboardStats,
  SalesTrendData,
  TopCategory,
  PerformanceResponse,
  TopSellingBook,
  RecentOrder,
} from "@/lib/services/dashboard.service"

const COLORS = ["#8b6914", "#d4a574", "#c9957e", "#a68a64"]

const statusClass: Record<string, string> = {
  "PENDING": "bg-yellow-100 text-yellow-700",
  "CONFIRMED": "bg-blue-100 text-blue-700",
  "PROCESSING": "bg-blue-100 text-blue-700",
  "SHIPPED": "bg-purple-100 text-purple-700",
  "DELIVERED": "bg-green-100 text-green-700",
  "CANCELLED": "bg-red-100 text-red-700",
  "COMPLETED": "bg-green-100 text-green-700",
}

const statusLabels: Record<string, string> = {
  "PENDING": "Chờ xác nhận",
  "CONFIRMED": "Đã xác nhận",
  "PROCESSING": "Đang xử lý",
  "SHIPPED": "Đang giao",
  "DELIVERED": "Đã giao",
  "CANCELLED": "Đã hủy",
  "COMPLETED": "Hoàn thành",
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesData, setSalesData] = useState<SalesTrendData[]>([])
  const [categoryData, setCategoryData] = useState<TopCategory[]>([])
  const [performance, setPerformance] = useState<PerformanceResponse | null>(null)
  const [topBooks, setTopBooks] = useState<TopSellingBook[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [statsData, salesTrend, topCategories, performanceData, topBooksData, recentOrdersData] =
          await Promise.all([
            dashboardService.getStats(),
            dashboardService.getSalesTrend(6),
            dashboardService.getTopCategories(),
            dashboardService.getPerformance(),
            dashboardService.getTopSellingBooks(5),
            dashboardService.getRecentOrders(4),
          ])

        setStats(statsData)
        setSalesData(salesTrend.data)
        setCategoryData(topCategories.categories)
        setPerformance(performanceData)
        setTopBooks(topBooksData.books)
        setRecentOrders(recentOrdersData.orders)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-8 px-4 py-6 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng quan kinh doanh</h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi hiệu suất bán hàng, tình trạng kho sách và các số liệu quan trọng khác.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Tổng doanh thu</h3>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.totalRevenue.toLocaleString("vi-VN")}₫</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">+{stats?.revenueGrowth}% so với tháng trước</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Đơn hàng</h3>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.totalOrders.toLocaleString("vi-VN")}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">+{stats?.ordersGrowth}% so với tháng trước</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Sách trong kho</h3>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.totalBooksInStock.toLocaleString("vi-VN")}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpenCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stats?.lowStockCount} sản phẩm sắp hết hàng</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wide">Khách hàng hoạt động</h3>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.activeCustomers.toLocaleString("vi-VN")}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">+{stats?.newCustomers} người dùng mới</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
          {/* Sales Chart */}
          <div className="2xl:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Doanh thu & đơn hàng</h2>
                <p className="text-sm text-muted-foreground">Số liệu 6 tháng gần nhất</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2} name="Doanh thu" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} name="Đơn hàng" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Chart */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Danh mục bán chạy</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryData.map(cat => ({ name: cat.categoryName, value: cat.percentage }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Orders Chart */}
          <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Đơn hàng theo tháng</h2>
                <p className="text-sm text-muted-foreground">So sánh tăng trưởng đơn hàng theo từng tháng</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="var(--color-primary)" name="Đơn hàng" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance goals */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Mục tiêu hiệu suất</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-xl border border-border/60 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tỷ lệ chuyển đổi</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{performance?.conversionRate.current}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Mục tiêu: {performance?.conversionRate.target}%</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-border/60 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tỷ lệ hài lòng</p>
                  <p className="text-xl font-semibold text-foreground mt-1">{performance?.satisfactionRate.current}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Mục tiêu: ≥ {performance?.satisfactionRate.target}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
          {/* Top books */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Sách bán chạy</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Sách</th>
                    <th className="pb-3 font-medium">Tác giả</th>
                    <th className="pb-3 font-medium">Danh mục</th>
                    <th className="pb-3 font-medium text-right">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {topBooks.map((book) => (
                    <tr key={book.id} className="border-b border-border/60 last:border-b-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-foreground">{book.title}</p>
                        <p className="text-sm text-muted-foreground">Đánh giá {book.averageRating.toFixed(1)}★ · {book.reviewCount} lượt</p>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{book.authorNames.join(", ")}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{book.categoryNames.join(", ")}</td>
                      <td className="py-3 text-right font-semibold text-primary">
                        {(book.discountPrice || book.price).toLocaleString("vi-VN")}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Đơn hàng gần đây</h2>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-border/60 rounded-xl p-4"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đơn</p>
                    <p className="font-semibold text-foreground">{order.orderCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium text-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.orderDate}</p>
                    <p className="font-semibold text-foreground">
                      {order.total.toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass[order.status] ?? "bg-muted text-foreground"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
