package com.notfound.bookstore.exception;

public class InsufficientStockException extends AppException {
    public InsufficientStockException() {
        super(ErrorCode.INSUFFICIENT_STOCK);
    }
}
