package com.notfound.bookstore.model.dto.request.orderrequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutRequest {
    @NotNull
    UUID addressId;

    @NotBlank
    String paymentMethod;

    String note;
    String discountCode;

    /**
     * Danh sách book IDs cần checkout.
     * Nếu null hoặc rỗng -> checkout toàn bộ giỏ hàng
     * Nếu có giá trị -> chỉ checkout các sản phẩm trong danh sách
     */
    List<UUID> bookIds;
}