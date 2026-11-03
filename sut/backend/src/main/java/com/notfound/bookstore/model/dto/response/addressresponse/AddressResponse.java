package com.notfound.bookstore.model.dto.response.addressresponse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response DTO chứa thông tin địa chỉ giao hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressResponse {
    UUID id;
    String recipientName;
    String phoneNumber;
    String street;
    String ward;
    String district;
    String province;
    BigDecimal latitude;
    BigDecimal longitude;
    Integer provinceId;
    Integer districtId;
    String wardCode;
}