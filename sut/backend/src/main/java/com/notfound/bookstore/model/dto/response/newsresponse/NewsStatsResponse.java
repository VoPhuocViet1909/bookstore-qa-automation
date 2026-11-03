package com.notfound.bookstore.model.dto.response.newsresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * News Statistics Response
 * Thống kê tổng quan về tin tức cho Admin Dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewsStatsResponse {
    
    // ========== Tổng quan ==========
    Long totalNews;           // Tổng số tin tức
    Long publishedNews;       // Tin đã xuất bản
    Long draftNews;          // Tin nháp
    Long archivedNews;       // Tin đã lưu trữ
    Long featuredNews;       // Tin nổi bật
    
    // ========== Theo thời gian ==========
    Long newNewsThisMonth;   // Tin tức mới tháng này
    Long newNewsThisWeek;    // Tin tức mới tuần này
    Long newNewsToday;       // Tin tức hôm nay
    
    // ========== Tương tác ==========
    Long totalViews;         // Tổng lượt xem
    Double avgViewsPerNews;  // Trung bình lượt xem/tin
    Long totalComments;      // Tổng bình luận (nếu có - dành cho tương lai)
    
    // ========== Thống kê theo category ==========
    List<NewsByCategoryStats> newsByCategory;
    
    // ========== Top tin tức ==========
    List<TopViewedNews> topViewedNews;
    
    // ========== Xu hướng ==========
    List<ViewsTrendData> viewsTrend;
    
    // ========== So sánh với tháng trước ==========
    Double newsGrowthPercentage;      // % tăng/giảm số tin so với tháng trước
    Double viewsGrowthPercentage;     // % tăng/giảm lượt xem so với tháng trước
    
    /**
     * Thống kê theo category
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class NewsByCategoryStats {
        String category;      // Tên category
        Long count;          // Số lượng tin
        Double percentage;   // Phần trăm
    }
    
    /**
     * Top tin tức được xem nhiều nhất
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TopViewedNews {
        String id;           // UUID của tin tức
        String title;        // Tiêu đề
        Long views;          // Số lượt xem
        String category;     // Category
        String publishedAt;  // Ngày xuất bản (ISO String)
    }
    
    /**
     * Xu hướng lượt xem theo thời gian
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ViewsTrendData {
        String date;         // Ngày (YYYY-MM-DD)
        Long views;          // Tổng lượt xem trong ngày
        Long newsCount;      // Số tin tức được đăng trong ngày
    }
}
