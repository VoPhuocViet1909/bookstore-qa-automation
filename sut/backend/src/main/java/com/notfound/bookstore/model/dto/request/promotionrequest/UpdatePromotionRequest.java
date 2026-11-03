package com.notfound.bookstore.model.dto.request.promotionrequest;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdatePromotionRequest {
    String name;

    @Pattern(regexp = "^[A-Z0-9]+$", message = "Mã khuyến mãi chỉ chứa chữ in hoa và số")
    String code;

    @DecimalMin(value = "0.0", message = "Phần trăm giảm giá phải >= 0")
    @DecimalMax(value = "100.0", message = "Phần trăm giảm giá phải <= 100")
    Double discountPercent;

    LocalDate startDate;

    LocalDate endDate;

    @Min(value = 1, message = "Giới hạn sử dụng phải >= 1")
    Integer usageLimit;

    String description;

    String status; // ACTIVE, INACTIVE, EXPIRED

    List<UUID> applicableBookIds;

    @AssertTrue(message = "Ngày kết thúc phải sau ngày bắt đầu")
    public boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true;
        }
        return !endDate.isBefore(startDate);
    }
}
