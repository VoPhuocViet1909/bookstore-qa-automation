package com.notfound.bookstore.model.dto.request.categoryrequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateCategoryRequest {
    String name;
    String description;
    String parentCategoryId;
}
