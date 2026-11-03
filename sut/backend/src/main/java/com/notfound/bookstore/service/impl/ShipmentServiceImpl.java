package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.shipmentrequest.GhnCreateOrderRequest;
import com.notfound.bookstore.model.dto.request.shipmentrequest.ShippingFeeRequest;
import com.notfound.bookstore.model.dto.response.orderresponse.OrderResponse;
import com.notfound.bookstore.model.dto.response.shipmentresponse.*;
import com.notfound.bookstore.model.entity.*;
import com.notfound.bookstore.model.enums.OrderStatus;
import com.notfound.bookstore.repository.BookRepository;
import com.notfound.bookstore.repository.OrderItemRepository;
import com.notfound.bookstore.repository.OrderRepository;
import com.notfound.bookstore.repository.ShipmentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.java.Log;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class ShipmentServiceImpl implements com.notfound.bookstore.service.ShipmentService {

    @Value("${shipment.ghn.url}")
    private String ghnApiUrl;

    @Value("${shipment.ghn.apiToken}")
    private String ghnToken;

    @Value("${shipment.ghn.shopId}")
    private String shopId;

    @Value("${shipment.ghn.address.fromDistrictId}")
    private Integer fromDistrictId;

    @Value("${shipment.ghn.address.fromWardCode}")
    private String fromWardCode;

    @Value("${shipment.ghn.defaultBook.length}")
    private Integer defaultBookLength;

    @Value("${shipment.ghn.defaultBook.width}")
    private Integer defaultBookWidth;

    @Value("${shipment.ghn.defaultBook.height}")
    private Integer defaultBookHeight;

    @Value("${shipment.ghn.defaultBook.weight}")
    private Integer defaultBookWeight;

    @Value("${shipment.ghn.shop.name}")
    String shopName;

    @Value("${shipment.ghn.shop.phone}")
    String shopPhone;

    @Value("${shipment.ghn.shop.address}")
    String shopAddress;

    @Value("${shipment.ghn.shop.ward}")
    String shopWard;

    @Value("${shipment.ghn.shop.district}")
    String shopDistrict;

    @Value("${shipment.ghn.shop.province}")
    String shopProvince;

    private static final int DEFAULT_BOOK_WEIGHT = 300; // gram
    private static final int DEFAULT_BOOK_HEIGHT = 2;

    private final RestTemplate restTemplate = new RestTemplate();

    private final ShipmentRepository shipmentRepository;

    @Override
    public List<CustomerProvinceResponse> getProvinces() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Token", ghnToken);

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            String url = ghnApiUrl + "/master-data/province";

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");

            return data.stream()
                    .filter(province -> (Integer) province.get("Status") == 1)
                    .map(province -> CustomerProvinceResponse.builder()
                            .provinceId((Integer) province.get("ProvinceID"))
                            .provinceName((String) province.get("ProvinceName"))
                            .code((String) province.get("Code"))
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting provinces from GHN", e);
            throw new RuntimeException("Failed to get provinces", e);
        }
    }

    @Override
    public List<CustomerDistrictResponse> getDistricts(Integer provinceId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Token", ghnToken);

            Map<String, Object> requestBody = Map.of("province_id", provinceId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = ghnApiUrl + "/master-data/district";

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");

            return data.stream()
                    .filter(district -> (Integer) district.get("Status") == 1)
                    .map(district -> CustomerDistrictResponse.builder()
                            .districtId((Integer) district.get("DistrictID"))
                            .provinceId((Integer) district.get("ProvinceID"))
                            .districtName((String) district.get("DistrictName"))
                            .supportType((Integer) district.get("SupportType"))
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting districts from GHN for provinceId: {}", provinceId, e);
            throw new RuntimeException("Failed to get districts", e);
        }
    }

    @Override
    public List<CustomerWardResponse> getWards(Integer districtId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Token", ghnToken);

            Map<String, Object> requestBody = Map.of("district_id", districtId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = ghnApiUrl + "/master-data/ward";

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");

            return data.stream()
                    .filter(ward -> (Integer) ward.get("Status") == 1)
                    .map(ward -> CustomerWardResponse.builder()
                            .wardCode(String.valueOf(ward.get("WardCode")))
                            .districtId((Integer) ward.get("DistrictID"))
                            .wardName((String) ward.get("WardName"))
                            .supportType((Integer) ward.get("SupportType"))
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting wards from GHN for districtId: {}", districtId, e);
            throw new RuntimeException("Failed to get wards", e);
        }
    }

    @Override
    public ShippingCalculationResponse calculateShipping(ShippingFeeRequest request) {
        try {
            // Lấy phí vận chuyển
            Map<String, Object> feeData = getShippingFee(request);

            // Lấy thời gian giao hàng dự kiến
            Map<String, Object> leadTimeResponse = getLeadTime(request.getToDistrictId(), request.getToWardCode());
            Map<String, Object> leadTimeData = (Map<String, Object>) leadTimeResponse.get("data");

            // Lấy thông tin leadtime_order
            Map<String, Object> leadtimeOrder = (Map<String, Object>) leadTimeData.get("leadtime_order");

            LocalDateTime estimatedDeliveryTime = null;
            Integer deliveryDays = null;

            if (leadtimeOrder != null) {
                String toEstimateDate = (String) leadtimeOrder.get("to_estimate_date");
                if (toEstimateDate != null) {
                    estimatedDeliveryTime = LocalDateTime.parse(toEstimateDate,
                            java.time.format.DateTimeFormatter.ISO_DATE_TIME);

                    // Tính số ngày từ hiện tại đến ngày giao
                    deliveryDays = (int) java.time.temporal.ChronoUnit.DAYS
                            .between(LocalDateTime.now(), estimatedDeliveryTime);
                }
            }

            return ShippingCalculationResponse.builder()
                    .totalFee(((Number) feeData.get("total")).intValue())
                    .serviceFee(((Number) feeData.get("service_fee")).intValue())
                    .insuranceFee(((Number) feeData.get("insurance_fee")).intValue())
                    .estimatedDeliveryTime(estimatedDeliveryTime)
                    .deliveryDays(deliveryDays)
                    .build();

        } catch (Exception e) {
            log.error("Error calculating shipping: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to calculate shipping", e);
        }
    }

    private Map<String, Object> getShippingFee(ShippingFeeRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        headers.set("ShopId", String.valueOf(shopId));

        Map<String, Object> requestBody = Map.of(
                "service_type_id", 2,
                "from_district_id", fromDistrictId,
                "from_ward_code", fromWardCode,
                "to_district_id", request.getToDistrictId(),
                "to_ward_code", request.getToWardCode(),
                "length", request.getLength() != null ? request.getLength() : defaultBookLength,
                "width", request.getWidth() != null ? request.getWidth() : defaultBookWidth,
                "height", request.getHeight() != null ? request.getHeight() : defaultBookHeight,
                "weight", request.getWeight() != null ? request.getWeight() : defaultBookWeight,
                "insurance_value", request.getInsuranceValue() != null ? request.getInsuranceValue() : 0
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String url = ghnApiUrl + "/v2/shipping-order/fee";

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        return (Map<String, Object>) response.getBody().get("data");
    }

    private Map<String, Object> getLeadTime(Integer toDistrictId, String toWardCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);

        Map<String, Object> requestBody = Map.of(
                "from_district_id", fromDistrictId,
                "from_ward_code", fromWardCode,
                "to_district_id", toDistrictId,
                "to_ward_code", toWardCode,
                "service_id", 53320
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String url = ghnApiUrl + "/v2/shipping-order/leadtime";

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        return response.getBody();
    }

    @Transactional
    @Override
    public Shipment createShipmentOrder(Order order) {
        try {
            if (shipmentRepository.existsByOrder(order)) {
                throw new AppException(ErrorCode.SHIPMENT_ALREADY_EXISTS);
            }

            GhnCreateOrderRequest request = buildGhnRequest(order);

            Logger logger = Logger.getLogger(ShipmentServiceImpl.class.getName());
            logger.info("GHN Create Order Request: " + request.toString());

            Map<String, Object> response = callGhnCreateOrderApi(request);

            Map<String, Object> data = (Map<String, Object>) response.get("data");
            String orderCode = (String) data.get("order_code");
            String sortCode = (String) data.get("sort_code");
            String expectedTimeStr = (String) data.get("expected_delivery_time");
            Double totalFee = ((Number) data.get("total_fee")).doubleValue();

            LocalDateTime expectedDeliveryTime = parseDateTime(expectedTimeStr);

            Shipment shipment = Shipment.builder()
                    .order(order)
                    .carrier("GHN")
                    .ghnOrderCode(orderCode)
                    .sortingCode(sortCode)
                    .ghnTotalFee(totalFee)
                    .expectedDeliveryTime(expectedDeliveryTime)
                    .status(Shipment.ShipmentStatus.READY_TO_PICK)
                    .codAmount(calculateCodAmount(order))
                    .note(request.getNote())
                    .build();

            shipmentRepository.save(shipment);

            log.info("Created shipment for order {} with GHN code: {}",
                    order.getOrderID(), orderCode);

            return shipment;

        } catch (Exception e) {
            log.error("Failed to create shipment for order {}", order.getOrderID(), e);
            throw new AppException(ErrorCode.SHIPMENT_CREATION_FAILED);
        }
    }

    @Override
    public Shipment getShipmentByOrderId(UUID orderId) {
        return shipmentRepository.findByOrder_OrderID(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPMENT_NOT_FOUND));
    }

    @Transactional
    @Override
    public void updateShipmentStatus(String ghnOrderCode, Shipment.ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findByGhnOrderCode(ghnOrderCode)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPMENT_NOT_FOUND));

        shipment.setStatus(status);

        LocalDateTime now = LocalDateTime.now();
        switch (status) {
            case PICKED -> shipment.setPickedAt(now);
            case DELIVERED -> shipment.setDeliveredAt(now);
            case RETURNED -> shipment.setReturnedAt(now);
            case CANCELLED -> shipment.setCancelledAt(now);
        }

        shipmentRepository.save(shipment);
        log.info("Updated shipment {} status to {}", ghnOrderCode, status);
    }

    private GhnCreateOrderRequest buildGhnRequest(Order order) {
        ShippingDetails details = order.getShippingDetails();

        // Tính tổng số sách từ OrderItems
        int totalBooks = order.getOrderItems().stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();

        int totalWeight = Math.min(DEFAULT_BOOK_WEIGHT * totalBooks, 50000);
        int totalHeight = Math.min(DEFAULT_BOOK_HEIGHT * totalBooks, 200);

        String contentBooks = order.getOrderItems().stream()
                .map(item -> String.format("- %s (x%d)",
                        item.getBook().getTitle(),
                        item.getQuantity()))
                .collect(Collectors.joining("\n"));

        return GhnCreateOrderRequest.builder()
                // From (Shop info)
                .fromName(shopName)
                .fromPhone(shopPhone)
                .fromAddress(shopAddress)
                .fromWardName(shopWard)
                .fromDistrictName(shopDistrict)
                .fromProvinceName(shopProvince)
                // To (Customer info)
                .toName(details.getRecipientName())
                .toPhone(details.getPhoneNumber())
                .toAddress(details.getFullAddress())
                .toWardName(details.getWard())
                .toDistrictName(details.getDistrict())
                .toProvinceName(details.getProvince())
                // Order details
                .codAmount(calculateCodAmount(order))
                .content(String.format("Đơn hàng sách - %d cuốn\n%s", totalBooks, contentBooks))
                .weight(totalWeight)
                .height(totalHeight)
                .insuranceValue(Math.min(order.getTotalAmount().intValue(), 5000000))
                .clientOrderCode(order.getOrderID().toString())
                .note(details.getShippingNote() != null
                        ? details.getShippingNote()
                        : "Giao hàng trong giờ hành chính")
                .build();
    }

    private Map<String, Object> callGhnCreateOrderApi(GhnCreateOrderRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        headers.set("ShopId", shopId);

        HttpEntity<GhnCreateOrderRequest> entity = new HttpEntity<>(request, headers);
        String url = ghnApiUrl + "/v2/shipping-order/create";

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, Map.class);

            Logger logger = Logger.getLogger(ShipmentServiceImpl.class.getName());
            logger.info("GHN Create Order Response: " + response.getBody().toString());

            Map<String, Object> body = response.getBody();
            if (body == null || !Integer.valueOf(200).equals(body.get("code"))) {
                throw new AppException(ErrorCode.GHN_API_ERROR);
            }

            return body;

        } catch (Exception e) {
            log.error("GHN API error: {}", e.getMessage());
            throw new AppException(ErrorCode.GHN_API_ERROR);
        }
    }

    private Integer calculateCodAmount(Order order) {
        return "COD".equalsIgnoreCase(order.getPaymentMethod())
                ? order.getTotalAmount().intValue()
                : 0;
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            log.warn("Failed to parse datetime: {}", dateTimeStr);
            return null;
        }
    }

    @Transactional
    @Override
    public void cancelShipmentOrder(String ghnOrderCode) {
        try {
            // Kiểm tra shipment tồn tại
            Shipment shipment = shipmentRepository.findByGhnOrderCode(ghnOrderCode)
                    .orElseThrow(() -> new AppException(ErrorCode.SHIPMENT_NOT_FOUND));

            // Gọi API GHN để hủy
            Map<String, Object> response = callGhnCancelOrderApi(ghnOrderCode);

            // Kiểm tra kết quả
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
            if (data != null && !data.isEmpty()) {
                Map<String, Object> result = data.get(0);
                Boolean success = (Boolean) result.get("result");

                if (Boolean.TRUE.equals(success)) {
                    // Cập nhật trạng thái shipment
                    shipment.setStatus(Shipment.ShipmentStatus.CANCELLED);
                    shipment.setCancelledAt(LocalDateTime.now());
                    shipmentRepository.save(shipment);

                    log.info("Cancelled shipment {} successfully", ghnOrderCode);
                } else {
                    String message = (String) result.get("message");
                    throw new AppException(ErrorCode.SHIPMENT_CANCEL_FAILED);
                }
            }

        } catch (Exception e) {
            log.error("Failed to cancel shipment {}", ghnOrderCode, e);
            throw new AppException(ErrorCode.SHIPMENT_CANCEL_FAILED);
        }
    }

    private Map<String, Object> callGhnCancelOrderApi(String ghnOrderCode) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", ghnToken);
        headers.set("ShopId", shopId);

        Map<String, Object> requestBody = Map.of(
                "order_codes", List.of(ghnOrderCode)
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String url = ghnApiUrl + "/v2/switch-status/cancel";

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null || !Integer.valueOf(200).equals(body.get("code"))) {
                throw new AppException(ErrorCode.GHN_API_ERROR);
            }

            return body;

        } catch (Exception e) {
            log.error("GHN cancel API error: {}", e.getMessage());
            throw new AppException(ErrorCode.GHN_API_ERROR);
        }
    }
}