package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.paymentrequest.MoMoCallbackRequest;
import com.notfound.bookstore.model.dto.request.paymentrequest.PaymentRequest;
import com.notfound.bookstore.model.dto.response.paymentresponse.CreatePaymentResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.PaymentResponse;

/**
 * Interface cho MoMo Payment Service
 * Định nghĩa các phương thức cụ thể cho MoMo payment gateway
 */
public interface MoMoService extends PaymentService {

    /**
     * Tạo URL thanh toán MoMo
     *
     * @param request Thông tin thanh toán (orderId, amount)
     * @return Response chứa URL thanh toán MoMo và thông tin payment
     */
    CreatePaymentResponse createMoMoPayment(PaymentRequest request);

    /**
     * Xử lý callback từ MoMo
     *
     * @param callback Dữ liệu callback từ MoMo
     * @return Kết quả xử lý thanh toán
     */
    PaymentResponse handleMoMoCallback(MoMoCallbackRequest callback);
}

