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
public class CreatePromotionRequest {
    @NotBlank(message = "Tên khuyến mãi là bắt buộc")
    String name;

    @NotBlank(message = "Mã khuyến mãi là bắt buộc")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Mã khuyến mãi chỉ chứa chữ in hoa và số")
    String code;

    @NotNull(message = "Phần trăm giảm giá là bắt buộc")
    @DecimalMin(value = "0.0", message = "Phần trăm giảm giá phải >= 0")
    @DecimalMax(value = "100.0", message = "Phần trăm giảm giá phải <= 100")
    Double discountPercent;

    @NotNull(message = "Ngày bắt đầu là bắt buộc")
    LocalDate startDate;

    @NotNull(message = "Ngày kết thúc là bắt buộc")
    LocalDate endDate;

    @NotNull(message = "Giới hạn sử dụng là bắt buộc")
    @Min(value = 1, message = "Giới hạn sử dụng phải >= 1")
    Integer usageLimit;

    String description;

    List<UUID> applicableBookIds; // Danh sách ID sách áp dụng (null = áp dụng cho tất cả)

    @AssertTrue(message = "Ngày kết thúc phải sau ngày bắt đầu")
    public boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true; // Validation khác sẽ xử lý null
        }
        return !endDate.isBefore(startDate);
    }
}
