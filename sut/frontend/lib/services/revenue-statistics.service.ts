/**
 * Revenue Statistics Service
 * Collects data from various APIs for AI report generation
 */

import { usersService, UserStatsResponse } from "./users.service";
import { ordersService, OrderResponse, OrderStatus } from "./orders.service";
import apiClient from "../api-client";

export interface RevenueStatisticsData {
  userStats: UserStatsResponse;
  ordersByStatus: Record<OrderStatus, number>;
  totalRevenue: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  period: "day" | "week" | "month";
}

export interface ReportPeriod {
  type: "day" | "week" | "month";
  startDate: string;
  endDate: string;
  label: string;
}

class RevenueStatisticsService {
  /**
   * Collect all statistics data for AI report generation
   */
  async collectStatisticsData(period?: ReportPeriod): Promise<RevenueStatisticsData> {
    try {
      // Determine date range
      const dateRange = period
        ? { startDate: period.startDate, endDate: period.endDate }
        : this.getDefaultDateRange();

      // Fetch user statistics với date range
      const userStats = await usersService.getUserStatistics(dateRange.startDate, dateRange.endDate);

      // Fetch orders by status với date range
      const ordersByStatus = await this.getOrdersByStatus(dateRange.startDate, dateRange.endDate);

      // Fetch total revenue với date range
      const totalRevenue = await ordersService.getTotalRevenue(dateRange.startDate, dateRange.endDate);

      return {
        userStats,
        ordersByStatus,
        totalRevenue,
        dateRange,
        period: period?.type || "month",
      };
    } catch (error: any) {
      console.error("Error collecting statistics data:", error);
      throw new Error(
        error.message || "Không thể thu thập dữ liệu thống kê"
      );
    }
  }

  /**
   * Get orders count by status
   */
  private async getOrdersByStatus(startDate?: string, endDate?: string): Promise<Record<OrderStatus, number>> {
    try {
      const statuses: OrderStatus[] = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "COMPLETED",
      ];

      const ordersByStatus: Record<OrderStatus, number> = {
        PENDING: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
        COMPLETED: 0,
      };

      // Fetch orders for each status với date range
      await Promise.all(
        statuses.map(async (status) => {
          try {
            const orders = await ordersService.getOrdersByStatus(status, startDate, endDate);
            ordersByStatus[status] = orders.length;
          } catch (error) {
            console.warn(`Failed to fetch orders for status ${status}:`, error);
            ordersByStatus[status] = 0;
          }
        })
      );

      return ordersByStatus;
    } catch (error: any) {
      console.error("Error getting orders by status:", error);
      // Return empty object on error
      return {
        PENDING: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
        COMPLETED: 0,
      };
    }
  }

  /**
   * Get default date range (current month)
   */
  private getDefaultDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }

  /**
   * Analyze revenue trends and generate insights
   */
  analyzeTrends(currentData: RevenueStatisticsData, previousData?: RevenueStatisticsData): {
    revenueChange: number;
    ordersChange: number;
    usersChange: number;
    insights: string[];
  } {
    const insights: string[] = [];

    if (!previousData) {
      insights.push("Không có dữ liệu kỳ trước để so sánh");
      return {
        revenueChange: 0,
        ordersChange: 0,
        usersChange: 0,
        insights,
      };
    }

    // Calculate changes
    const revenueChange =
      previousData.totalRevenue > 0
        ? ((currentData.totalRevenue - previousData.totalRevenue) /
            previousData.totalRevenue) *
          100
        : 0;

    const ordersChange =
      previousData.userStats.totalOrders > 0
        ? ((currentData.userStats.totalOrders -
            previousData.userStats.totalOrders) /
            previousData.userStats.totalOrders) *
          100
        : 0;

    const usersChange =
      previousData.userStats.totalUsers > 0
        ? ((currentData.userStats.totalUsers -
            previousData.userStats.totalUsers) /
            previousData.userStats.totalUsers) *
          100
        : 0;

    // Generate insights
    if (revenueChange > 10) {
      insights.push(`Doanh thu tăng trưởng mạnh ${revenueChange.toFixed(1)}%`);
    } else if (revenueChange > 0) {
      insights.push(`Doanh thu tăng ${revenueChange.toFixed(1)}%`);
    } else if (revenueChange < -10) {
      insights.push(`Doanh thu giảm đáng kể ${Math.abs(revenueChange).toFixed(1)}%`);
    } else if (revenueChange < 0) {
      insights.push(`Doanh thu giảm ${Math.abs(revenueChange).toFixed(1)}%`);
    }

    if (ordersChange > 5) {
      insights.push(`Số đơn hàng tăng ${ordersChange.toFixed(1)}%`);
    }

    if (usersChange > 5) {
      insights.push(`Số người dùng mới tăng ${usersChange.toFixed(1)}%`);
    }

    return {
      revenueChange,
      ordersChange,
      usersChange,
      insights,
    };
  }
}

export const revenueStatisticsService = new RevenueStatisticsService();
export default revenueStatisticsService;
