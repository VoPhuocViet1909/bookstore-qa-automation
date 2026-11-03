package com.notfound.bookstore.model.dto.request.bookrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookFilterRequest {
    String keyword;

    @DecimalMin(value = "0.0", message = "Giá tối thiểu phải lớn hơn hoặc bằng 0")
    Double minPrice;

    @DecimalMin(value = "0.0", message = "Giá tối đa phải lớn hơn hoặc bằng 0")
    Double maxPrice;

    @DecimalMin(value = "0.0", message = "Rating tối thiểu là 0")
    @DecimalMax(value = "5.0", message = "Rating tối đa là 5")
    Double minRating;

    LocalDate publishedAfter;

    // Custom validation method
    @AssertTrue(message = "Giá tối đa phải lớn hơn giá tối thiểu")
    public boolean isValidPriceRange() {
        if (minPrice != null && maxPrice != null) {
            return maxPrice >= minPrice;
        }
        return true;
    }

    @Min(0)
    @Builder.Default
    Integer page = 0;

    @Min(1)
    @Max(100)
    @Builder.Default
    Integer size = 10;
}
