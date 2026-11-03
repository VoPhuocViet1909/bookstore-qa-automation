package com.notfound.bookstore.model.dto.response.bookresponse;

import com.notfound.bookstore.model.dto.response.reviewresponse.ReviewResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookDetailResponse {
    String isbn;
    String publisher;
    LocalDate publishDate;
    List<ReviewResponse> reviews;
    List<BookResponse> relatedBooks;
}