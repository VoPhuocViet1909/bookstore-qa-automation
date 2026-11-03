package com.notfound.bookstore.model.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RecentOrdersResponse {
    List<OrderSummary> orders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OrderSummary {
        UUID id;
        String orderCode;
        String customerName;
        BigDecimal total;
        LocalDateTime orderDate;
        String status;
    }
}
