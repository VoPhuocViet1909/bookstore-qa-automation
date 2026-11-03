package com.notfound.bookstore.model.dto.request.shipmentrequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@ToString
public class GhnCreateOrderRequest {

    @JsonProperty("payment_type_id")
    @Builder.Default
    @Min(1) @Max(2)
    Integer paymentTypeId = 2;

    @JsonProperty("required_note")
    @Builder.Default
    @NotBlank
    String requiredNote = "KHONGCHOXEMHANG";

    @Size(max = 5000)
    String note;

    // From (Shop info)
    @JsonProperty("from_name")
    @NotBlank
    @Size(max = 1024)
    String fromName;

    @JsonProperty("from_phone")
    @NotBlank
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$")
    String fromPhone;

    @JsonProperty("from_address")
    @NotBlank
    @Size(max = 1024)
    String fromAddress;

    @JsonProperty("from_ward_name")
    @NotBlank
    String fromWardName;

    @JsonProperty("from_district_name")
    @NotBlank
    String fromDistrictName;

    @JsonProperty("from_province_name")
    @NotBlank
    String fromProvinceName;

    // To (Customer info)
    @JsonProperty("to_name")
    @NotBlank
    @Size(max = 1024)
    String toName;

    @JsonProperty("to_phone")
    @NotBlank
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$")
    String toPhone;

    @JsonProperty("to_address")
    @NotBlank
    @Size(max = 1024)
    String toAddress;

    @JsonProperty("to_ward_name")
    @NotBlank
    String toWardName;

    @JsonProperty("to_district_name")
    @NotBlank
    String toDistrictName;

    @JsonProperty("to_province_name")
    @NotBlank
    String toProvinceName;

    // Order details
    @JsonProperty("cod_amount")
    @Min(0)
    @Max(50000000)
    Integer codAmount;

    @Size(max = 2000)
    String content;

    @Builder.Default
    @Min(1) @Max(200)
    Integer length = 20;

    @Builder.Default
    @Min(1) @Max(200)
    Integer width = 15;

    @Builder.Default
    @Min(1) @Max(200)
    Integer height = 2;

    @Builder.Default
    @Min(1) @Max(50000)
    Integer weight = 300;

    @JsonProperty("insurance_value")
    @Min(0)
    @Max(5000000)
    Integer insuranceValue;

    @JsonProperty("service_type_id")
    @Builder.Default
    Integer serviceTypeId = 2;

    String coupon;

    @JsonProperty("client_order_code")
    @Size(max = 50)
    String clientOrderCode;
}