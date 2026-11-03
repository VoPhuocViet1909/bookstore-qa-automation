package com.notfound.bookstore.model.dto.response.promotionresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionValidationResponse {
    Boolean isValid;
    String message;
    UUID promotionID;
    String code;
    Double discountPercent;
    String reason; // Lý do không hợp lệ nếu isValid = false
}
