package com.notfound.bookstore.model.dto.response.categoryresponse;

import com.notfound.bookstore.model.dto.response.bookresponse.BookSummaryResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryBooksResponse implements Serializable {
    CategoryResponse category;
    List<BookSummaryResponse> books;
}
