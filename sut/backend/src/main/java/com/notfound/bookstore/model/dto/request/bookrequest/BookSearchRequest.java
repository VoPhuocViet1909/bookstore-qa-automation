package com.notfound.bookstore.model.dto.request.bookrequest;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookSearchRequest {
    String keyword;
    String categoryId;
    String authorId;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    String sortBy;
    String sortOrder;

    @Min(0)
    Integer page;

    @Min(1)
    @Max(100)
    Integer size;
}