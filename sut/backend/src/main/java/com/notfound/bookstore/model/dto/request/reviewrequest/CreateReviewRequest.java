package com.notfound.bookstore.model.dto.request.reviewrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateReviewRequest {
    @NotNull(message = "Book ID không được để trống")
    UUID bookId;

    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating phải từ 1-5")
    @Max(value = 5, message = "Rating phải từ 1-5")
    Integer rating;

    @NotBlank(message = "Comment không được để trống")
    @Size(min = 10, max = 1000, message = "Comment phải từ 10-1000 ký tự")
    String comment;
}