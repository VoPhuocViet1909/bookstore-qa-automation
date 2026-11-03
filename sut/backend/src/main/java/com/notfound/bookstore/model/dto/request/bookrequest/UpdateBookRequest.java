package com.notfound.bookstore.model.dto.request.bookrequest;

import com.notfound.bookstore.model.entity.Book;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PastOrPresent;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateBookRequest {
    String title;

    String isbn;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    Double price;

    @DecimalMin(value = "0.0", message = "Discount price must be positive")
    Double discountPrice;

    @DecimalMin(value = "0.0", message = "Import price must be positive")
    Double importPrice;

    @Min(value = 0, message = "Stock cannot be negative")
    Integer stockQuantity;

    @PastOrPresent(message = "Publish date cannot be in the future")
    LocalDate publishDate;

    String description;

    Book.Status status;

    @jakarta.validation.constraints.NotEmpty(message = "At least one author is required")
    List<UUID> authorIds;

    @jakarta.validation.constraints.NotEmpty(message = "At least one category is required")
    List<UUID> categoryIds;
}
