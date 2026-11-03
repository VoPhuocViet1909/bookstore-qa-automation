package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.shipmentrequest.ShippingFeeRequest;
import com.notfound.bookstore.model.dto.response.shipmentresponse.CustomerDistrictResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.CustomerProvinceResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.CustomerWardResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.ShippingCalculationResponse;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.Shipment;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface ShipmentService {
    List<CustomerProvinceResponse> getProvinces();

    List<CustomerDistrictResponse> getDistricts(Integer provinceId);

    List<CustomerWardResponse> getWards(Integer districtId);

    ShippingCalculationResponse calculateShipping(ShippingFeeRequest request);

    @Transactional
    Shipment createShipmentOrder(Order order);

    Shipment getShipmentByOrderId(UUID orderId);

    @Transactional
    void updateShipmentStatus(String ghnOrderCode, Shipment.ShipmentStatus status);

    @Transactional
    void cancelShipmentOrder(String ghnOrderCode);
}
