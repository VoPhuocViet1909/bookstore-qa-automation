package com.notfound.bookstore.model.dto.response.shipmentresponse;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProvinceResponse {

    @JsonProperty("ProvinceID")
    Integer provinceId;

    @JsonProperty("ProvinceName")
    String provinceName;

    @JsonProperty("CountryID")
    Integer countryId;

    @JsonProperty("Code")
    String code;

    @JsonProperty("NameExtension")
    List<String> nameExtension;

    @JsonProperty("IsEnable")
    Integer isEnable;

    @JsonProperty("RegionID")
    Integer regionId;

    @JsonProperty("RegionCPN")
    Integer regionCPN;

    @JsonProperty("CanUpdateCOD")
    Boolean canUpdateCOD;

    @JsonProperty("Status")
    Integer status;
}