package com.notfound.bookstore.model.dto.request.paymentrequest;

import lombok.*;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ZaloPayCallbackRequest {
    private String data;
    private String mac;
}
