package com.notfound.bookstore.model.mapper;

import com.notfound.bookstore.model.dto.response.paymentresponse.CreatePaymentResponse;
import com.notfound.bookstore.model.dto.response.paymentresponse.PaymentResponse;
import com.notfound.bookstore.model.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    /**
     * Map Payment entity to PaymentResponse
     */
    @Mapping(source = "paymentID", target = "paymentId")
    @Mapping(source = "order.orderID", target = "orderId")
    @Mapping(source = "paymentMethod", target = "paymentMethod")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "date", target = "paymentDate")
    @Mapping(source = "status", target = "status")
    PaymentResponse toPaymentResponse(Payment payment);

    /**
     * Success response with ApiResponse wrapper
     */
    default CreatePaymentResponse toSuccessResponse(Payment payment, String paymentUrl) {
          return CreatePaymentResponse.builder()
                .code("SUCCESS")
                .message("Payment created successfully. Please complete payment on VNPay.")
                .paymentUrl(paymentUrl)
                .payment(toPaymentResponse(payment))
                .build();
    }

    /**
     * Error response with ApiResponse wrapper
     */
    default CreatePaymentResponse toErrorResponse(String message) {
        return CreatePaymentResponse.builder()
                .code("ERROR")
                .message(message)
                .paymentUrl(null)
                .payment(null)
                .build();
    }

    /**
     * Pending response with ApiResponse wrapper
     */
    default CreatePaymentResponse toPendingResponse(Payment payment, String paymentUrl) {
        return CreatePaymentResponse.builder()
                .code("PENDING")
                .message("Payment is already pending. Please complete the existing payment.")
                .paymentUrl(paymentUrl)
                .payment(toPaymentResponse(payment))
                .build();

    }
}