package com.notfound.bookstore.model.dto.response.orderresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    UUID id;
    String orderCode;
    LocalDateTime orderDate;
    String status;
    BigDecimal subtotal;
    BigDecimal total;
    String paymentMethod;
    BigDecimal taxAmount;
    BigDecimal shippingFee;

    // Thông tin khuyến mãi
    String promotionCode;
    String promotionName;
    Double discountPercent;
    BigDecimal discountAmount;

    // Thông tin khách hàng
    UUID customerId;
    String customerName;
    String customerEmail;
    String customerPhone;
    String customerMembershipTier;

    // Thông tin giao hàng (từ ShippingDetails)
    String recipientName;
    String recipientPhone;
    String shippingAddress;      // fullAddress
    String shippingProvince;     // province
    String shippingDistrict;     // district
    String shippingWard;         // ward
    String shippingNote;         // shippingNote

    List<OrderItemResponse> items;

    String note;
}
