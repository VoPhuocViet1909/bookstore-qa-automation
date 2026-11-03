package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.response.dashboard.*;

public interface DashboardService {

    // Lấy thống kê tổng quan
    DashboardStatsResponse getStats();

    // Lấy xu hướng doanh thu theo tháng
    SalesTrendResponse getSalesTrend(Integer months);

    // Lấy danh mục bán chạy nhất
    TopCategoriesResponse getTopCategories();

    // Lấy các chỉ số hiệu suất
    PerformanceMetricsResponse getPerformanceMetrics();

    // Lấy sách bán chạy nhất
    TopSellingBooksResponse getTopSellingBooks(Integer limit);

    // Lấy đơn hàng gần đây
    RecentOrdersResponse getRecentOrders(Integer limit);
}
