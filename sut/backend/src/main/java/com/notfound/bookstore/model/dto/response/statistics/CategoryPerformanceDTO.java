package com.notfound.bookstore.model.dto.response.statistics;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryPerformanceDTO {
    String category;
    Double revenue;
    Double growth; // Growth percentage compared to previous period
}
