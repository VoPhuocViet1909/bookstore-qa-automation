package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.paymentrequest.PaymentRequest;
import com.notfound.bookstore.model.dto.response.paymentresponse.CreatePaymentResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.PaymentResponse;

/**
 * Interface cho các dịch vụ thanh toán
 * Định nghĩa các phương thức chung cho tất cả payment gateway (MoMo, VNPay, ZaloPay, etc.)
 */
public interface PaymentService {

    /**
     * Tạo URL thanh toán
     *
     * @param request Thông tin thanh toán (orderId, amount)
     * @return Response chứa URL thanh toán và thông tin payment
     */
    CreatePaymentResponse createPayment(PaymentRequest request);

    /**
     * Xử lý callback từ payment gateway
     *
     * @param callbackData Dữ liệu callback từ payment gateway
     * @return Kết quả xử lý thanh toán
     */
    PaymentResponse handleCallback(Object callbackData);

    /**
     * Xử lý return URL (user redirect back)
     *
     * @return Response trả về cho người dùng
     */
    PaymentResponse handleReturn();
}

