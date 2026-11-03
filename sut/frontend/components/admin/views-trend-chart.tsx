/**
 * ViewsTrendChart Component
 * Biểu đồ đường xu hướng lượt xem theo thời gian
 */

"use client"

import { ViewsTrendData } from "@/lib/services/news.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts"
import { TrendingUp } from "lucide-react"

interface ViewsTrendChartProps {
  data: ViewsTrendData[]
}

export function ViewsTrendChart({ data }: ViewsTrendChartProps) {
  // Format date cho trục X
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  // Transform data
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    views: item.views,
    newsCount: item.newsCount
  }))

  // Tính tổng và trung bình
  const totalViews = data.reduce((sum, item) => sum + item.views, 0)
  const avgViews = data.length > 0 ? Math.round(totalViews / data.length) : 0
  const totalNews = data.reduce((sum, item) => sum + item.newsCount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Xu hướng lượt xem
        </CardTitle>
        <CardDescription>
          Lượt xem và số tin tức được đăng theo ngày (30 ngày gần nhất)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Tổng lượt xem</p>
                <p className="text-2xl font-bold text-primary">{totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">TB lượt xem/ngày</p>
                <p className="text-2xl font-bold text-blue-600">{avgViews.toLocaleString()}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Tổng tin đã đăng</p>
                <p className="text-2xl font-bold text-green-600">{totalNews.toLocaleString()}</p>
              </div>
            </div>

            {/* Biểu đồ */}
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Lượt xem', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Số tin', angle: 90, position: 'insideRight' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium mb-2">{payload[0].payload.fullDate}</p>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-violet-500" />
                              Lượt xem: <span className="font-bold">{payload[0].value?.toLocaleString()}</span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-emerald-500" />
                              Tin đăng: <span className="font-bold">{payload[1].value?.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  fill="url(#colorViews)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Lượt xem"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="newsCount"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Tin đăng"
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Phân tích xu hướng */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Phân tích:</strong> Trong 30 ngày qua, có tổng cộng{" "}
                <span className="text-primary font-medium">{totalViews.toLocaleString()}</span> lượt xem
                với trung bình{" "}
                <span className="text-primary font-medium">{avgViews.toLocaleString()}</span> lượt/ngày.{" "}
                Đã đăng{" "}
                <span className="text-green-600 font-medium">{totalNews}</span> tin tức mới.
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            Chưa có dữ liệu
          </div>
        )}
      </CardContent>
    </Card>
  )
}
