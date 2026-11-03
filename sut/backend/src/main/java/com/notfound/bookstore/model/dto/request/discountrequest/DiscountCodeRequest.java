package com.notfound.bookstore.model.dto.request.discountrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DiscountCodeRequest {
    @NotBlank(message = "Discount code is required")
    String code;

    @NotNull
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    BigDecimal discountPercent;

    @NotNull
    LocalDateTime validFrom;

    @NotNull
    LocalDateTime validTo;

    @Min(1)
    Integer maxUses;
}