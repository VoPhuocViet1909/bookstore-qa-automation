package com.notfound.bookstore.service;

import com.notfound.bookstore.model.dto.request.paymentrequest.PaymentRequest;
import com.notfound.bookstore.model.dto.request.paymentrequest.ZaloPayCallbackRequest;
import com.notfound.bookstore.model.dto.response.paymentresponse.CreatePaymentResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.ZaloPayCallBackResponseDTO;
import org.springframework.transaction.annotation.Transactional;

public interface ZaloPayService {
    @Transactional
    CreatePaymentResponse createOrderTransaction(PaymentRequest body);

    ZaloPayCallBackResponseDTO processCallback(ZaloPayCallbackRequest body);
}
