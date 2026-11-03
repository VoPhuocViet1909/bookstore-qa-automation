package com.notfound.bookstore.model.dto.response.shipmentresponse;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerDistrictResponse {

    Integer districtId;
    Integer provinceId;
    String districtName;
    Integer supportType;
}
