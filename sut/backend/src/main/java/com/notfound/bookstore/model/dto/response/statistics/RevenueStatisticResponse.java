package com.notfound.bookstore.model.dto.response.statistics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RevenueStatisticResponse {
    Double totalRevenue;
    Long totalOrders;
    List<DailyRevenuePoint> breakdown;
    List<PercentageDTO> revenueByPaymentMethod;
    List<CategoryPerformanceDTO> categoryPerformance;
}
