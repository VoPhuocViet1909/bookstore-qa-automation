package com.notfound.bookstore.model.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatsResponse {
    BigDecimal totalRevenue;
    Double revenueGrowth; // % so với tháng trước
    Long totalOrders;
    Double ordersGrowth;
    Long totalBooksInStock;
    Long lowStockCount;
    Long activeCustomers;
    Long newCustomers;
}
