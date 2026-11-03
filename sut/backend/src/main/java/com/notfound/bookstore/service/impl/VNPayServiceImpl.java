package com.notfound.bookstore.service.impl;

import com.notfound.bookstore.config.VNPayConfig;
import com.notfound.bookstore.exception.AppException;
import com.notfound.bookstore.exception.ErrorCode;
import com.notfound.bookstore.model.dto.request.paymentrequest.PaymentRequest;
import com.notfound.bookstore.model.dto.request.paymentrequest.VNPayCallbackRequest;
import com.notfound.bookstore.model.dto.response.ApiResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.CreatePaymentResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.PaymentResponse;
import com.notfound.bookstore.model.entity.Order;
import com.notfound.bookstore.model.entity.Payment;
import com.notfound.bookstore.model.enums.PaymentMethod;
import com.notfound.bookstore.model.enums.PaymentStatus;
import com.notfound.bookstore.model.mapper.PaymentMapper;
import com.notfound.bookstore.repository.OrderRepository;
import com.notfound.bookstore.repository.PaymentRepository;
import com.notfound.bookstore.service.OrderTimeoutService;
import com.notfound.bookstore.service.ShipmentService;
import com.notfound.bookstore.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayServiceImpl {

    private final VNPayUtil vnPayUtil;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ShipmentService shipmentService;
    private final OrderTimeoutService orderTimeoutService;

    private static final int PAYMENT_TIMEOUT_MINUTES = 15; // Timeout sau 15 phút
    private final PaymentMapper paymentMapper;
    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Tạo URL thanh toán VNPay
     */
    @Transactional
    public CreatePaymentResponse createVNPayPaymentUrl(
            PaymentRequest request,
            HttpServletRequest httpServletRequest
    ) {
        try {
            // 1. Validate Order
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

            // 2. Check existing pending payment
            Optional<Payment> existingPayment = paymentRepository
                    .findByOrderAndStatus(order, PaymentStatus.PENDING);

            if (existingPayment.isPresent()) {
                Payment payment = existingPayment.get();

                // Check if expired (>15 mins)
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

                    // Generate VNPay URL with existing transaction ID
                    String paymentUrl = vnPayUtil.generatePaymentUrl(
                            transactionId,
                            payment.getAmount(),
                            httpServletRequest
                    );

                    return paymentMapper.toSuccessResponse(payment, paymentUrl);
                }
            }

            // 3. Generate transaction ID BEFORE creating payment
            String transactionId = generateTransactionId();

            // 4. Create new payment
            Payment payment = Payment.builder()
                    .order(order)
                    .amount(request.getAmount())
                    .transactionId(transactionId)
                    .paymentMethod(String.valueOf(PaymentMethod.VNPay))
                    .status(PaymentStatus.PENDING)
                    .build();

            payment = paymentRepository.save(payment);

            // Schedule order timeout after 15 minutes
            orderTimeoutService.scheduleOrderTimeout(order.getOrderID(), PAYMENT_TIMEOUT_MINUTES);
            log.info("Scheduled timeout for order {} in {} minutes", order.getOrderID(), PAYMENT_TIMEOUT_MINUTES);

            // 5. Generate VNPay URL
            String paymentUrl = vnPayUtil.generatePaymentUrl(
                    transactionId,
                    payment.getAmount(),
                    httpServletRequest
            );
            return paymentMapper.toSuccessResponse(payment, paymentUrl);
        } catch (AppException e) {
            return paymentMapper.toErrorResponse(e.getMessage());

        } catch (Exception e) {
            return paymentMapper.toErrorResponse("Failed to create payment: " + e.getMessage());
        }
    }

    public PaymentResponse handleVNPayReturn(VNPayCallbackRequest vnpParams) {

        boolean isValidSignature = vnPayUtil.verifyReturnDataSignature(vnpParams);

        if (!isValidSignature) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_SIGNATURE);
        }

        String transactionId = vnpParams.getVnp_TxnRef();

        Payment payment = paymentRepository.findPaymentByTransactionId(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() != PaymentStatus.PENDING) {

            // Return current payment info without updating
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                return paymentMapper.toPaymentResponse(payment);
            } else {
                throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
            }
        }

        if (vnpParams.isSuccess()) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setDate(LocalDateTime.now());
            payment.setPaymentMethod(String.valueOf(PaymentMethod.VNPay));

            // Cancel the timeout since payment is successful
            orderTimeoutService.cancelOrderTimeout(payment.getOrder().getOrderID());
            log.info("Cancelled timeout for order {} - payment successful", payment.getOrder().getOrderID());

            //Thành công sẽ tạo shipment ở bước sau
            shipmentService.createShipmentOrder(payment.getOrder());

        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);

        return paymentMapper.toPaymentResponse(payment);
    }

    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        // Generate 8 random alphanumeric characters
        StringBuilder randomPart = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            int index = random.nextInt(ALPHANUMERIC.length());
            randomPart.append(ALPHANUMERIC.charAt(index));
        }

        // Get current timestamp
        long timestamp = System.currentTimeMillis();

        // Format: PAY_<random>_<timestamp>
        String transactionId = String.format("PAY_%s_%d", randomPart.toString(), timestamp);

        log.debug("Generated random transaction ID: {}", transactionId);

        return transactionId;
    }

    /**
     * Lấy redirectUrl từ Payment entity theo transactionId
     * @param transactionId Transaction ID của payment
     * @return redirectUrl hoặc null nếu không tìm thấy
     */
    public String getRedirectUrlByTransactionId(String transactionId) {
        try {
            Payment payment = paymentRepository.findPaymentByTransactionId(transactionId)
                    .orElse(null);

            if (payment != null) {
                return payment.getRedirectUrl();
            }

            log.warn("Payment not found for transactionId: {}", transactionId);
            return null;
        } catch (Exception e) {
            log.error("Error getting redirectUrl for transactionId {}: {}", transactionId, e.getMessage());
            return null;
        }
    }
}
