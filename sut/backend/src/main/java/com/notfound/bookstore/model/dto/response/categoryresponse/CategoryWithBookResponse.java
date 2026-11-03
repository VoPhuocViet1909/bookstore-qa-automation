package com.notfound.bookstore.model.dto.response.categoryresponse;

import com.notfound.bookstore.model.dto.response.bookresponse.BookResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryWithBookResponse implements Serializable {
    UUID id;
    String name;
    String description;
    BookResponse sampleBook;
}
