package com.notfound.bookstore.model.dto.response.shipmentresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerWardResponse {

    String wardCode;
    Integer districtId;
    String wardName;
    Integer supportType;
}