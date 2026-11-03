/**
 * NewsCategoryChart Component
 * Biểu đồ tròn phân bố tin tức theo category
 */

"use client"

import { NewsByCategoryStats } from "@/lib/services/news.service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface NewsCategoryChartProps {
  data: NewsByCategoryStats[]
}

// Màu sắc cho từng category
const COLORS = [
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function NewsCategoryChart({ data }: NewsCategoryChartProps) {
  // Transform data for Recharts
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.count,
    percentage: item.percentage,
    fill: COLORS[index % COLORS.length]
  }))

  // Custom label hiển thị phần trăm
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố tin tức theo danh mục</CardTitle>
        <CardDescription>
          Tỷ lệ phần trăm tin tức theo từng category
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{payload[0].name}</p>
                          <p className="text-sm text-muted-foreground">
                            {payload[0].value} tin ({payload[0].payload.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    `${value} (${entry.payload.value})`
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Danh sách chi tiết */}
            <div className="mt-4 space-y-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{item.value} tin</span>
                    <span className="font-medium">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Chưa có dữ liệu
          </div>
        )}
      </CardContent>
    </Card>
  )
}
