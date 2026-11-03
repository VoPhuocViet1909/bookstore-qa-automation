package com.notfound.bookstore.model.dto.response.statisticsresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueStatisticsResponse {
    BigDecimal totalRevenue;
    Integer totalOrders;
    Integer totalCustomers;
    List<DailyRevenueResponse> dailyData;
}