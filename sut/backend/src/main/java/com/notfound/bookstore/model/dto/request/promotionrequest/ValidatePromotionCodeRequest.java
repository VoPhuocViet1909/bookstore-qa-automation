package com.notfound.bookstore.model.dto.request.promotionrequest;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ValidatePromotionCodeRequest {
    @NotBlank(message = "Mã khuyến mãi là bắt buộc")
    String code;

    List<UUID> bookIds; // Danh sách ID sách trong giỏ hàng để kiểm tra áp dụng
}
