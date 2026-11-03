package com.notfound.bookstore.model.dto.response.shipmentresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GhnCreateOrderResponse {

    String orderCode;
    String sortCode;
    String expectedDeliveryTime;
    Double totalFee;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeBreakdown {
        Double mainService;
        Double insurance;
        Double stationDo;
        Double stationPu;
        Double returnFee;
        Double r2s;
        Double coupon;
        Double codFailedFee;
    }
}