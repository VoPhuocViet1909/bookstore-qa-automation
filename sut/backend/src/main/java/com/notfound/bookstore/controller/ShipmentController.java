package com.notfound.bookstore.controller;

import com.notfound.bookstore.model.dto.request.shipmentrequest.ShippingFeeRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.bookresponse.BookFullDetailResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.CustomerDistrictResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.CustomerProvinceResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.CustomerWardResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.ShippingCalculationResponse;
import com.notfound.bookstore.service.impl.ShipmentServiceImpl;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/shipment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShipmentController {

    ShipmentServiceImpl shipmentService;

    @GetMapping("/customer/province")
    public ApiResponse<List<CustomerProvinceResponse>> getAllProvince() {

        List<CustomerProvinceResponse> response = shipmentService.getProvinces();

        return ApiResponse.<List<CustomerProvinceResponse>>builder()
                .code(1000)
                .message("Lấy thông tin các tỉnh thành thành công")
                .result(response)
                .build();
    }

    @GetMapping("/customer/district")
    public ApiResponse<List<CustomerDistrictResponse>> getDistrictsByProvince(
            @RequestParam Integer provinceId) {

        List<CustomerDistrictResponse> response = shipmentService.getDistricts(provinceId);

        return ApiResponse.<List<CustomerDistrictResponse>>builder()
                .code(1000)
                .message("Lấy thông tin các huyện thành công")
                .result(response)
                .build();
    }

    @GetMapping("/customer/ward")
    public ApiResponse<List<CustomerWardResponse>> getWardsByDistrict(
            @RequestParam Integer districtId) {

        List<CustomerWardResponse> response = shipmentService.getWards(districtId);

        return ApiResponse.<List<CustomerWardResponse>>builder()
                .code(1000)
                .message("Lấy thông tin các xã/phường thành công")
                .result(response)
                .build();
    }

    @PostMapping("/customer/calculate")
    public ApiResponse<ShippingCalculationResponse> calculateShipping(
            @RequestBody @Valid ShippingFeeRequest request) {

        ShippingCalculationResponse response = shipmentService.calculateShipping(request);

        return ApiResponse.<ShippingCalculationResponse>builder()
                .code(1000)
                .message("Tính phí giao hàng thành công")
                .result(response)
                .build();
    }
}
