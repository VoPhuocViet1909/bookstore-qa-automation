package com.notfound.bookstore.model.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SalesTrendResponse {
    List<MonthlyData> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthlyData {
        String month; // "2024-01"
        String monthName; // "Tháng 1"
        BigDecimal sales;
        Long orders;
        Long customers;
    }
}
