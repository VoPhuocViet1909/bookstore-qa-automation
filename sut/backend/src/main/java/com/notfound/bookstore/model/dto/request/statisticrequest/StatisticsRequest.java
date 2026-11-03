package com.notfound.bookstore.model.dto.request.statisticrequest;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticsRequest {
    @NotNull
    LocalDate startDate;

    @NotNull
    LocalDate endDate;

    @Pattern(regexp = "^(day|month|year)$", message = "Group by must be: day, month, or year")
    String groupBy;
}