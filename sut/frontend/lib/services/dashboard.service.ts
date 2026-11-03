/**
 * Dashboard Service
 * Handles all admin dashboard-related API calls
 */

import { apiClient } from "../api-client";

// Stats interfaces
export interface DashboardStats {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    totalBooksInStock: number;
    lowStockCount: number;
    activeCustomers: number;
    newCustomers: number;
}

// Sales trend interfaces
export interface SalesTrendData {
    month: string;
    monthName: string;
    sales: number;
    orders: number;
    customers: number;
}

export interface SalesTrendResponse {
    data: SalesTrendData[];
}

// Top categories interfaces
export interface TopCategory {
    categoryId: string;
    categoryName: string;
    percentage: number;
    totalSales: number;
}

export interface TopCategoriesResponse {
    categories: TopCategory[];
}

// Performance interfaces
export interface PerformanceMetric {
    current: number;
    target: number;
}

export interface PerformanceResponse {
    conversionRate: PerformanceMetric;
    satisfactionRate: PerformanceMetric;
}

// Top books interfaces
export interface TopSellingBook {
    id: string;
    title: string;
    authorNames: string[];
    categoryNames: string[];
    price: number;
    discountPrice: number;
    averageRating: number;
    reviewCount: number;
    soldQuantity: number;
}

export interface TopBooksResponse {
    books: TopSellingBook[];
}

// Recent orders interfaces
export interface RecentOrder {
    id: string;
    orderCode: string;
    customerName: string;
    total: number;
    orderDate: string;
    status: string;
}

export interface RecentOrdersResponse {
    orders: RecentOrder[];
}

export const dashboardService = {
    /**
     * Get dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    async getStats(): Promise<DashboardStats> {
        return apiClient.get<DashboardStats>("/admin/dashboard/stats");
    },

    /**
     * Get sales trend data
     * GET /api/admin/dashboard/sales-trend
     */
    async getSalesTrend(months: number = 6): Promise<SalesTrendResponse> {
        return apiClient.get<SalesTrendResponse>("/admin/dashboard/sales-trend", { months });
    },

    /**
     * Get top categories by sales
     * GET /api/admin/dashboard/top-categories
     */
    async getTopCategories(): Promise<TopCategoriesResponse> {
        return apiClient.get<TopCategoriesResponse>("/admin/dashboard/top-categories");
    },

    /**
     * Get performance metrics
     * GET /api/admin/dashboard/performance
     */
    async getPerformance(): Promise<PerformanceResponse> {
        return apiClient.get<PerformanceResponse>("/admin/dashboard/performance");
    },

    /**
     * Get top selling books
     * GET /api/admin/dashboard/top-selling-books
     */
    async getTopSellingBooks(limit: number = 5): Promise<TopBooksResponse> {
        return apiClient.get<TopBooksResponse>("/admin/dashboard/top-selling-books", { limit });
    },

    /**
     * Get recent orders
     * GET /api/admin/dashboard/recent-orders
     */
    async getRecentOrders(limit: number = 4): Promise<RecentOrdersResponse> {
        return apiClient.get<RecentOrdersResponse>("/admin/dashboard/recent-orders", { limit });
    },
};
