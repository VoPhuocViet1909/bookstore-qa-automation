package com.notfound.bookstore.model.dto.response.shipmentresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShippingCalculationResponse {

    Integer totalFee;
    Integer serviceFee;
    Integer insuranceFee;
    LocalDateTime estimatedDeliveryTime;
    Integer deliveryDays;
}