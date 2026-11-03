package com.notfound.bookstore.model.dto.response.bookresponse;

import com.notfound.bookstore.model.entity.Book;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookFullDetailResponse {
    UUID id;
    String title;
    String isbn;
    Double price;
    Double discountPrice;
    Double importPrice;
    Integer stockQuantity;
    LocalDate publishDate;
    String description;
    Book.Status status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String createdBy;
    String updatedBy;

    List<AuthorInfo> authors;
    List<CategoryInfo> categories;
    List<ImageInfo> images;

    Double averageRating;
    Integer totalReviews;
    Integer totalOrders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class AuthorInfo {
        UUID id;
        String name;
        String biography;
        LocalDate dateOfBirth;
        String nationality;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CategoryInfo {
        UUID id;
        String name;
        String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ImageInfo {
        Long id;
        String url;
        Integer priority;
        LocalDateTime uploadedAt;
    }
}
