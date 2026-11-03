package com.notfound.bookstore.model.dto.response.statistics;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PercentageDTO {
    String category; // e.g. Payment Method Name
    Double value;    // e.g. Percentage or Absolute Value
}
