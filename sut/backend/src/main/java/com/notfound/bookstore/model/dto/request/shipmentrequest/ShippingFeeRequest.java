package com.notfound.bookstore.model.dto.request.shipmentrequest;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShippingFeeRequest {

    Integer toDistrictId;
    String toWardCode;

    @Builder.Default
    Integer length = 20;

    @Builder.Default
    Integer width = 15;

    Integer height;
    Integer weight;

    @Builder.Default
    Integer insuranceValue = 0;
}