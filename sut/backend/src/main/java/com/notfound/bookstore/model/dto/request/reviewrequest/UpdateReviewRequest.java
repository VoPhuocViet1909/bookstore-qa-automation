package com.notfound.bookstore.model.dto.request.reviewrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateReviewRequest {
    @Min(1)
    @Max(5)
    Integer rating;

    @Size(max = 1000)
    String comment;
}