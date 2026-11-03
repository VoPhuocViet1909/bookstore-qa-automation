package com.notfound.bookstore.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notfound.bookstore.config.MoMoConfig;
import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.paymentrequest.MoMoCallbackRequest;
import com.notfound.bookstore.model.dto.request.paymentrequest.PaymentRequest;
import com.notfound.bookstore.model.dto.response.paymentresponse.CreatePaymentResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.PaymentResponse;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.Payment;
import com.notfound.bookstore.model.enums.PaymentMethod;
import com.notfound.bookstore.model.enums.PaymentStatus;
import com.notfound.bookstore.model.mapper.PaymentMapper;
import com.notfound.bookstore.repository.OrderRepository;
import com.notfound.bookstore.repository.PaymentRepository;
import com.notfound.bookstore.service.MoMoService;
import com.notfound.bookstore.service.OrderTimeoutService;
import com.notfound.bookstore.service.ShipmentService;
import com.notfound.bookstore.util.MoMoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MoMoServiceImpl implements MoMoService {

    private final MoMoConfig moMoConfig;
    private final MoMoUtil moMoUtil;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final ShipmentService shipmentService;
    private final OrderTimeoutService orderTimeoutService;

    private static final int PAYMENT_TIMEOUT_MINUTES = 15; // Timeout sau 15 phút
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Implementation of PaymentService.createPayment()
     * Delegates to createMoMoPayment()
     */
    @Override
    public CreatePaymentResponse createPayment(PaymentRequest request) {
        return createMoMoPayment(request);
    }

    /**
     * Implementation of PaymentService.handleCallback()
     * Delegates to handleMoMoCallback() with type casting
     */
    @Override
    public PaymentResponse handleCallback(Object callbackData) {
        if (callbackData instanceof MoMoCallbackRequest) {
            return handleMoMoCallback((MoMoCallbackRequest) callbackData);
        }
        throw new AppException(ErrorCode.INVALID_PAYMENT_CALLBACK);
    }

    /**
     * Implementation of PaymentService.handleReturn()
     * Returns a simple success response for MoMo return URL
     */
    @Override
    public PaymentResponse handleReturn() {
        return PaymentResponse.builder()
                .status(PaymentStatus.COMPLETED)
                .build();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public CreatePaymentResponse createMoMoPayment(PaymentRequest request) {
        try {
            // 1. Validate Order
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));



            // 2. Check existing pending payment
            Optional<Payment> existingPayment = paymentRepository
                    .findByOrderAndStatus(order, PaymentStatus.PENDING);

            if (existingPayment.isPresent()) {
                Payment payment = existingPayment.get();
                LocalDateTime expiryTime = payment.getDate().plusMinutes(15);

                if (LocalDateTime.now().isAfter(expiryTime)) {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                } else {
                    String transactionId = payment.getTransactionId();
                    if (transactionId == null || transactionId.isEmpty()) {
                        transactionId = generateTransactionId();
                        payment.setTransactionId(transactionId);
                        payment = paymentRepository.save(payment);
                    }

                    // Generate MoMo payment URL with existing transaction and redirectUrl from Frontend
                    String paymentUrl = createMoMoPaymentUrl(transactionId, payment.getAmount(), request.getRedirectUrl());
                    return paymentMapper.toSuccessResponse(payment, paymentUrl);
                }
            }

            // 3. Generate transaction ID
            String transactionId = generateTransactionId();

            // 4. Create new payment
            Payment payment = Payment.builder()
                    .order(order)
                    .amount(request.getAmount())
                    .transactionId(transactionId)
                    .paymentMethod(String.valueOf(PaymentMethod.MoMo))
                    .status(PaymentStatus.PENDING)
                    .redirectUrl(request.getRedirectUrl()) // ⭐ Lưu redirectUrl từ Frontend
                    .build();

            payment = paymentRepository.save(payment);

            // Schedule order timeout after 15 minutes
            orderTimeoutService.scheduleOrderTimeout(order.getOrderID(), PAYMENT_TIMEOUT_MINUTES);
            log.info("Scheduled timeout for order {} in {} minutes", order.getOrderID(), PAYMENT_TIMEOUT_MINUTES);

            // 5. Generate MoMo payment URL with redirectUrl from Frontend
            String paymentUrl = createMoMoPaymentUrl(transactionId, payment.getAmount(), request.getRedirectUrl());
            return paymentMapper.toSuccessResponse(payment, paymentUrl);

        } catch (AppException e) {
            return paymentMapper.toErrorResponse(e.getMessage());
        } catch (Exception e) {
            log.error("Error creating MoMo payment: {}", e.getMessage(), e);
            return paymentMapper.toErrorResponse("Failed to create MoMo payment: " + e.getMessage());
        }
    }

    private String createMoMoPaymentUrl(String transactionId, Long amount, String redirectUrl) {
        try {
            String requestId = transactionId;
            String orderId = transactionId;
            String orderInfo = "Thanh toán đơn hàng " + orderId;

            // Encode redirectUrl vào extraData (Base64) để Frontend có thể redirect về đúng URL
            String extraData = "";
            if (redirectUrl != null && !redirectUrl.isEmpty()) {
                extraData = Base64.getEncoder().encodeToString(redirectUrl.getBytes());
                log.debug("Encoded redirectUrl into extraData: {} -> {}", redirectUrl, extraData);
            } else {
                // Fallback to config if no redirectUrl provided
                extraData = moMoConfig.getExtraData();
            }

            // Build raw signature data (theo thứ tự của MoMo)
            String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + moMoConfig.getNotifyUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + moMoConfig.getPartnerCode() +
                    "&redirectUrl=" + moMoConfig.getReturnUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + moMoConfig.getRequestType();

            log.debug("MoMo raw signature: {}", rawSignature);

            String signature = moMoUtil.generateSignature(rawSignature);

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("partnerCode", moMoConfig.getPartnerCode());
            requestBody.put("accessKey", moMoConfig.getAccessKey());
            requestBody.put("requestId", requestId);
            requestBody.put("amount", amount);
            requestBody.put("orderId", orderId);
            requestBody.put("orderInfo", orderInfo);
            requestBody.put("redirectUrl", moMoConfig.getReturnUrl());
            requestBody.put("ipnUrl", moMoConfig.getNotifyUrl());
            requestBody.put("extraData", extraData); // ⭐ Chứa redirectUrl đã encode
            requestBody.put("requestType", moMoConfig.getRequestType());
            requestBody.put("signature", signature);
            requestBody.put("lang", "vi");

            // Send request to MoMo
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Sending MoMo request: {}", objectMapper.writeValueAsString(requestBody));

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    moMoConfig.getApiEndpoint(),
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Integer resultCode = (Integer) responseBody.get("resultCode");

                if (resultCode != null && resultCode == 0) {
                    String payUrl = (String) responseBody.get("payUrl");
                    log.info("MoMo payment URL created successfully: {}", payUrl);
                    return payUrl;
                } else {
                    String message = (String) responseBody.get("message");
                    log.error("MoMo returned error: {} - {}", resultCode, message);
                    throw new RuntimeException("MoMo error: " + message);
                }
            } else {
                throw new RuntimeException("Failed to get response from MoMo");
            }

        } catch (Exception e) {
            log.error("Error creating MoMo payment URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create MoMo payment URL", e);
        }
    }

    @Override
    @Transactional
    public PaymentResponse handleMoMoCallback(MoMoCallbackRequest callback) {
        try {
            // 1. Verify signature
            String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                    "&amount=" + callback.getAmount() +
                    "&extraData=" + callback.getExtraData() +
                    "&message=" + callback.getMessage() +
                    "&orderId=" + callback.getOrderId() +
                    "&orderInfo=" + callback.getOrderInfo() +
                    "&orderType=" + callback.getOrderType() +
                    "&partnerCode=" + callback.getPartnerCode() +
                    "&payType=" + callback.getPayType() +
                    "&requestId=" + callback.getRequestId() +
                    "&responseTime=" + callback.getResponseTime() +
                    "&resultCode=" + callback.getResultCode() +
                    "&transId=" + callback.getTransId();

            boolean isValid = moMoUtil.verifySignature(rawSignature, callback.getSignature());

            if (!isValid) {
                log.error("Invalid MoMo signature");
                throw new AppException(ErrorCode.INVALID_PAYMENT_SIGNATURE);
            }

            // 2. Find payment by transaction ID
            String transactionId = callback.getOrderId();
            Payment payment = paymentRepository.findPaymentByTransactionId(transactionId)
                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

            // 3. Check if already processed
            if (payment.getStatus() != PaymentStatus.PENDING) {
                if (payment.getStatus() == PaymentStatus.COMPLETED) {
                    return paymentMapper.toPaymentResponse(payment);
                } else {
                    throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
                }
            }

            // 4. Update payment status
            if (callback.getResultCode() == 0) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setDate(LocalDateTime.now());
                payment.setPaymentMethod(String.valueOf(PaymentMethod.MoMo));

                // 5. Update Order status to PROCESSING when payment successful
                Order order = payment.getOrder();
                order.setStatus(com.notfound.bookstore.model.enums.OrderStatus.PROCESSING);
                orderRepository.save(order);

                // Cancel the timeout since payment is successful
                orderTimeoutService.cancelOrderTimeout(order.getOrderID());
                log.info("Cancelled timeout for order {} - payment successful", order.getOrderID());

                // 6. Create shipment order (same as VNPay)
                try {
                    shipmentService.createShipmentOrder(order);
                    log.info("Shipment order created for order: {}", order.getOrderID());
                } catch (Exception e) {
                    log.error("Failed to create shipment for order {}: {}", order.getOrderID(), e.getMessage(), e);
                    // Don't fail the payment if shipment creation fails
                }

                log.info("Payment completed for order: {}. Order status changed to PROCESSING", order.getOrderID());
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                log.warn("MoMo payment failed: {} - {}", callback.getResultCode(), callback.getMessage());
            }

            paymentRepository.save(payment);
            return paymentMapper.toPaymentResponse(payment);

        } catch (Exception e) {
            log.error("Error handling MoMo callback: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to handle MoMo callback", e);
        }
    }

    private String generateTransactionId() {
        StringBuilder randomPart = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            int index = random.nextInt(ALPHANUMERIC.length());
            randomPart.append(ALPHANUMERIC.charAt(index));
        }
        long timestamp = System.currentTimeMillis();
        return String.format("PAY_%s_%d", randomPart.toString(), timestamp);
    }

    /**
     * Lấy redirectUrl từ Payment entity theo transactionId
     *
     * @param transactionId Transaction ID của payment
     * @return redirectUrl đã lưu khi tạo payment, hoặc null nếu không tìm thấy
     */
    public String getRedirectUrlByTransactionId(String transactionId) {
        try {
            Payment payment = paymentRepository.findPaymentByTransactionId(transactionId)
                    .orElse(null);
            return payment != null ? payment.getRedirectUrl() : null;
        } catch (Exception e) {
            log.error("Error getting redirectUrl for transactionId: {}", transactionId, e);
            return null;
        }
    }
}
