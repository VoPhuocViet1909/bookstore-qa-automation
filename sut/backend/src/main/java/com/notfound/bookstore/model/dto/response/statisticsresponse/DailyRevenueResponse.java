package com.notfound.bookstore.model.dto.response.statisticsresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DailyRevenueResponse {
    LocalDate date;
    BigDecimal revenue;
    Integer orderCount;
}