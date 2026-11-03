package com.notfound.bookstore.model.dto.request.bookrequest;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookSortRequest {
    @Pattern(regexp = "price_asc|price_desc|title_asc|title_desc|date_asc|date_desc|rating_asc|rating_desc",
            message = "Invalid sort type")
    @Builder.Default
    String sortType = "date_desc";

    @Min(0)
    @Builder.Default
    Integer page = 0;

    @Min(1)
    @Max(100)
    @Builder.Default
    Integer size = 10;
}
