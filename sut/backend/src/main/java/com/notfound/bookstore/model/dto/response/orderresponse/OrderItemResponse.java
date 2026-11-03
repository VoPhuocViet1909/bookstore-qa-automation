package com.notfound.bookstore.model.dto.response.orderresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemResponse {
    UUID id;
    UUID bookId;
    String bookTitle;
    String bookIsbn;
    String bookImageUrl;
    Integer quantity;
    BigDecimal unitPrice;
    BigDecimal subtotal;
}