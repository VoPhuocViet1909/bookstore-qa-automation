package com.notfound.bookstore.model.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopSellingBooksResponse {
    List<BookSalesData> books;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class BookSalesData {
        UUID id;
        String title;
        List<String> authorNames;
        List<String> categoryNames;
        Double price;
        Double discountPrice;
        Double averageRating;
        Integer reviewCount;
        Long soldQuantity;
    }
}
