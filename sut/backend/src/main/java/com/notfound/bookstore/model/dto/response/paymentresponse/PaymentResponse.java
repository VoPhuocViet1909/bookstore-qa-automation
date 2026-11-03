package com.notfound.bookstore.model.dto.response.paymentresponse;

import com.notfound.bookstore.model.entity.Payment;
import com.notfound.bookstore.model.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    UUID paymentId;
    UUID orderId;
    String paymentMethod;
    Double amount;
    LocalDateTime paymentDate;
    PaymentStatus status;
}