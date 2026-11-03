/**
 * TopViewedNewsChart Component
 * Biểu đồ cột top tin tức được xem nhiều nhất
 */

"use client"

import { TopViewedNews } from "@/lib/services/news.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Eye } from "lucide-react"

interface TopViewedNewsChartProps {
  data: TopViewedNews[]
}

// Gradient colors for bars
const BAR_COLORS = [
  '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff',
  '#f3e8ff', '#fae8ff', '#fce7f3', '#fbcfe8', '#f9a8d4'
]

export function TopViewedNewsChart({ data }: TopViewedNewsChartProps) {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    title: item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title,
    fullTitle: item.title,
    views: item.views,
    category: item.category,
    fill: BAR_COLORS[index % BAR_COLORS.length]
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Top 10 tin tức xem nhiều nhất
        </CardTitle>
        <CardDescription>
          Tin tức có lượt xem cao nhất trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="title"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Lượt xem', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
                          <p className="font-medium mb-1">{payload[0].payload.fullTitle}</p>
                          <p className="text-sm text-muted-foreground mb-1">
                            Category: {payload[0].payload.category}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {payload[0].value?.toLocaleString()} lượt xem
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Bar dataKey="views" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Danh sách chi tiết */}
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-sm">Chi tiết</h4>
              <div className="space-y-2">
                {data.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => window.open(`/news/${item.id}`, '_blank')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                        <p className="font-medium text-sm truncate">{item.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium ml-4">
                      <Eye className="h-4 w-4 text-primary" />
                      <span>{item.views.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Chưa có dữ liệu
          </div>
        )}
      </CardContent>
    </Card>
  )
}
