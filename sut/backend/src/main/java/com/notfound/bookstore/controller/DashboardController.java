package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.dashboard.*;
import com.notfound.bookstore.service.DashboardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API cho Admin Dashboard
 * Cung cấp thống kê tổng quan, xu hướng doanh thu, và các chỉ số hiệu suất
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    DashboardService dashboardService;

    /**
     * Lấy thống kê tổng quan
     * GET /api/admin/dashboard/stats
     * 
     * @return Thống kê về doanh thu, đơn hàng, kho, khách hàng
     */
    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats() {
        log.info("GET /api/admin/dashboard/stats - Getting dashboard statistics");
        return ApiResponse.<DashboardStatsResponse>builder()
                .code(1000)
                .message("Lấy thống kê dashboard thành công")
                .result(dashboardService.getStats())
                .build();
    }

    /**
     * Lấy xu hướng doanh thu theo tháng
     * GET /api/admin/dashboard/sales-trend?months=6
     * 
     * @param months Số tháng muốn xem (mặc định: 6)
     * @return Dữ liệu doanh thu, đơn hàng, khách hàng theo từng tháng
     */
    @GetMapping("/sales-trend")
    public ApiResponse<SalesTrendResponse> getSalesTrend(
            @RequestParam(required = false, defaultValue = "6") Integer months) {
        log.info("GET /api/admin/dashboard/sales-trend - Getting sales trend for {} months", months);
        return ApiResponse.<SalesTrendResponse>builder()
                .code(1000)
                .message("Lấy xu hướng doanh thu thành công")
                .result(dashboardService.getSalesTrend(months))
                .build();
    }

    /**
     * Lấy danh mục bán chạy nhất
     * GET /api/admin/dashboard/top-categories
     * 
     * @return Top 5 danh mục với doanh thu và phần trăm
     */
    @GetMapping("/top-categories")
    public ApiResponse<TopCategoriesResponse> getTopCategories() {
        log.info("GET /api/admin/dashboard/top-categories - Getting top selling categories");
        return ApiResponse.<TopCategoriesResponse>builder()
                .code(1000)
                .message("Lấy danh mục bán chạy thành công")
                .result(dashboardService.getTopCategories())
                .build();
    }

    /**
     * Lấy các chỉ số hiệu suất
     * GET /api/admin/dashboard/performance
     * 
     * @return Conversion rate và satisfaction rate
     */
    @GetMapping("/performance")
    public ApiResponse<PerformanceMetricsResponse> getPerformanceMetrics() {
        log.info("GET /api/admin/dashboard/performance - Getting performance metrics");
        return ApiResponse.<PerformanceMetricsResponse>builder()
                .code(1000)
                .message("Lấy chỉ số hiệu suất thành công")
                .result(dashboardService.getPerformanceMetrics())
                .build();
    }

    /**
     * Lấy sách bán chạy nhất
     * GET /api/admin/dashboard/top-selling-books?limit=5
     * 
     * @param limit Số lượng sách muốn lấy (mặc định: 5)
     * @return Danh sách sách bán chạy với thông tin chi tiết
     */
    @GetMapping("/top-selling-books")
    public ApiResponse<TopSellingBooksResponse> getTopSellingBooks(
            @RequestParam(required = false, defaultValue = "5") Integer limit) {
        log.info("GET /api/admin/dashboard/top-selling-books - Getting top {} selling books", limit);
        return ApiResponse.<TopSellingBooksResponse>builder()
                .code(1000)
                .message("Lấy sách bán chạy thành công")
                .result(dashboardService.getTopSellingBooks(limit))
                .build();
    }

    /**
     * Lấy đơn hàng gần đây
     * GET /api/admin/dashboard/recent-orders?limit=4
     * 
     * @param limit Số lượng đơn hàng muốn lấy (mặc định: 4)
     * @return Danh sách đơn hàng gần nhất
     */
    @GetMapping("/recent-orders")
    public ApiResponse<RecentOrdersResponse> getRecentOrders(
            @RequestParam(required = false, defaultValue = "4") Integer limit) {
        log.info("GET /api/admin/dashboard/recent-orders - Getting {} recent orders", limit);
        return ApiResponse.<RecentOrdersResponse>builder()
                .code(1000)
                .message("Lấy đơn hàng gần đây thành công")
                .result(dashboardService.getRecentOrders(limit))
                .build();
    }
}
