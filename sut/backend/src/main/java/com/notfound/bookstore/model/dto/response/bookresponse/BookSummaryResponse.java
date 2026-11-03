package com.notfound.bookstore.model.dto.response.bookresponse;

import com.notfound.bookstore.model.entity.Book;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookSummaryResponse implements Serializable {
    UUID id;
    String title;
    Double price;
    Double discountPrice;
    String mainImageUrl;
    Double averageRating;
    Integer reviewCount;
    Integer stockQuantity;
    Book.Status status;
    List<String> authorNames;
    List<String> categoryId;
}
