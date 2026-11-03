package com.notfound.bookstore.model.dto.response.bookresponse;

import com.notfound.bookstore.model.entity.Book;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookResponse {
    String id;
    String title;
    String isbn;
    Double price;
    Double importPrice;
    Double discountPrice;
    Integer stockQuantity;
    LocalDate publishDate;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String createdBy;
    String updatedBy;
    List<String> categoryId;
    String description;
    Book.Status status;
    List<String> authorNames;
    List<String> categoryNames;
    List<String> imageUrls;
    Double averageRating;
    Integer reviewCount;
}