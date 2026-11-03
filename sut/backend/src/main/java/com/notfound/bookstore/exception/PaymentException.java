package com.notfound.bookstore.exception;

public class PaymentException extends AppException {
    public PaymentException() {
        super(ErrorCode.PAYMENT_FAILED);
    }
}