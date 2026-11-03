package com.notfound.bookstore.model.dto.response.statistics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DailyRevenuePoint {
    LocalDate date;
    Double revenue;
    Long orderCount;
}
