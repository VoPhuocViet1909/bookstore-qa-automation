package com.notfound.bookstore.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ==== 4xx: Lỗi phía client ====
    BAD_REQUEST(HttpStatus.BAD_REQUEST, 4000, "Invalid syntax for this request."),
    ADDRESS_NOT_FOUND(HttpStatus.NOT_FOUND, 2002, "Address not found."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, 4010, "User not authenticated."),
    FORBIDDEN(HttpStatus.FORBIDDEN, 4030, "Access denied."),
    NOT_FOUND(HttpStatus.NOT_FOUND, 4040, "Resource not found."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, 4050, "HTTP method not supported."),
    NOT_ACCEPTABLE(HttpStatus.NOT_ACCEPTABLE, 4060, "Invalid Accept header."),
    CONFLICT(HttpStatus.CONFLICT, 4090, "Conflict with current state of resource."),
    GONE(HttpStatus.GONE, 4100, "The requested resource is no longer available."),
    LENGTH_REQUIRED(HttpStatus.LENGTH_REQUIRED, 4110, "Content length required."),
    PRECONDITION_FAILED(HttpStatus.PRECONDITION_FAILED, 4120, "Request precondition failed."),
    PAYLOAD_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, 4130, "Request entity too large."),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, 4150, "Media type not supported."),
    UNPROCESSABLE_ENTITY(HttpStatus.UNPROCESSABLE_ENTITY, 4220, "Semantic validation failed."),
    MISSING_ARGUMENTS(HttpStatus.BAD_REQUEST, 4190, "Missing required arguments."),
    INVALID_ARGUMENTS(HttpStatus.BAD_REQUEST, 4200, "Invalid request parameters."),

    // ==== 5xx: Lỗi phía server ====
    // Lỗi
    ERROR_ENCODE(HttpStatus.INTERNAL_SERVER_ERROR, 3005, "Error encoding URL parameters."),
    ERROR_CREATE_HMACSHA512(HttpStatus.INTERNAL_SERVER_ERROR, 3000, "Error creating HMAC-SHA512 signature."),
    INVALID_PAYMENT_SIGNATURE(HttpStatus.BAD_REQUEST, 3001, "Invalid Payment signature."),
    INVALID_PAYMENT_CALLBACK(HttpStatus.BAD_REQUEST, 3006, "Invalid payment callback data."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, 3002, "Payment amount mismatch."),
    PAYMENT_TRANSACTION_FAILED(HttpStatus.BAD_REQUEST, 3003, "Payment transaction failed."),
    PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, 3004, "Payment not found"),
    PAYMENT_CONFIG_MISSING(HttpStatus.INTERNAL_SERVER_ERROR, 3004, "Payment configuration is missing."),
    PAYMENT_ALREADY_PROCESSED(HttpStatus.BAD_REQUEST, 3004, "Payment already processed."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 5000, "Unexpected internal server error."),
    NOT_IMPLEMENTED(HttpStatus.NOT_IMPLEMENTED, 5010, "Feature not implemented."),
    BAD_GATEWAY(HttpStatus.BAD_GATEWAY, 5020, "Invalid response from upstream server."),
    SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, 5030, "Service currently unavailable."),
    GATEWAY_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, 5040, "Gateway timeout."),
    INITIALIZATION_FAILURE(HttpStatus.INTERNAL_SERVER_ERROR, 5500, "Service initialization failure."),

    // --- TOKEN ERRORS ---
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, 2000, "Token has expired."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, 2004, "Invalid token."),
    INVALID_TOKEN_TYPE(HttpStatus.UNAUTHORIZED, 2002, "Invalid token type."),

    // ==== Lỗi xác thực/người dùng (nhánh con của 4xx) ====
    USER_EXISTED(HttpStatus.CONFLICT, 2001, "User already exists."),
    USERNAME_EXISTED(HttpStatus.CONFLICT, 2013, "Tên đăng nhập đã tồn tại."),
    EMAIL_EXISTED(HttpStatus.CONFLICT, 2014, "Email đã tồn tại."),
    MAIL_NOT_EXISTED(HttpStatus.NOT_FOUND, 2003, "Mail not exists"),
    TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, 4290, "OTP chưa hết hạn, vui lòng thử lại sau."),
    USER_NOT_EXISTED(HttpStatus.NOT_FOUND, 2002, "User not found."),
    BOOK_NOT_FOUND(HttpStatus.NOT_FOUND, 3001, "Book not found."),
    INSUFFICIENT_STOCK(HttpStatus.CONFLICT, 3002, "Insufficient stock available."),
    PAYMENT_FAILED(HttpStatus.PAYMENT_REQUIRED, 4020, "Payment processing failed."),
    USERNAME_INVALID(HttpStatus.BAD_REQUEST, 2003, "Username must be at least 3 characters."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, 2004, "Password must be at least 8 characters."),
    INVALID_KEY(HttpStatus.BAD_REQUEST, 2005, "Invalid API key."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, 1002, "Username or password fail"),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, 3001, "Order not found."),

    // ==== Lỗi khuyến mãi ====
    PROMOTION_NOT_FOUND(HttpStatus.NOT_FOUND, 4001, "Khuyến mãi không tồn tại."),
    PROMOTION_CODE_INVALID(HttpStatus.BAD_REQUEST, 4002, "Mã khuyến mãi không hợp lệ."),
    PROMOTION_CODE_EXPIRED(HttpStatus.BAD_REQUEST, 4003, "Mã khuyến mãi đã hết hạn."),
    PROMOTION_CODE_USED_UP(HttpStatus.BAD_REQUEST, 4004, "Mã khuyến mãi đã hết lượt sử dụng."),
    PROMOTION_CODE_NOT_APPLICABLE(HttpStatus.BAD_REQUEST, 4005, "Mã khuyến mãi không áp dụng cho sản phẩm này."),
    PROMOTION_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, 4006, "Mã khuyến mãi đã tồn tại."),
    PROMOTION_INACTIVE(HttpStatus.BAD_REQUEST, 4007, "Khuyến mãi đang không hoạt động."),

    // ==== Lỗi hệ thống không phân loại ====
    UNCATEGORIZED_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, 9999, "Uncategorized error"),

    // ==== Lỗi Tin tức ====
    NEWS_NOT_FOUND(HttpStatus.NOT_FOUND, 6001, "News not found."),

    // ==== Lỗi Quản lý Người dùng ====
    USER_HAS_ORDERS(HttpStatus.CONFLICT, 2010, "Cannot delete user with existing orders."),
    CANNOT_DELETE_ADMIN(HttpStatus.FORBIDDEN, 2011, "Cannot delete admin user."),
    CANNOT_BAN_ADMIN(HttpStatus.FORBIDDEN, 2012, "Cannot ban admin user."),

    // ==== Lỗi Danh Sách Yêu Thích (Wishlist) ====
    BOOK_ALREADY_IN_WISHLIST(HttpStatus.FORBIDDEN,4001, "Book already in wishlist"),
    BOOK_NOT_IN_WISHLIST(HttpStatus.FORBIDDEN, 4002, "Book not in wishlist"),
    WISHLIST_EMPTY(HttpStatus.FORBIDDEN,4003, "Wishlist is empty"),

    // ==== Lỗi Vận chuyển (Shipment) ====
    SHIPMENT_NOT_FOUND(HttpStatus.NOT_FOUND, 7001, "Shipment not found."),
    SHIPMENT_ALREADY_EXISTS(HttpStatus.CONFLICT, 7002, "Shipment already exists for this order."),
    SHIPMENT_CREATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, 7003, "Failed to create shipment."),
    GHN_API_ERROR(HttpStatus.BAD_GATEWAY, 7004, "GHN API error occurred."),
    GHN_INVALID_RESPONSE(HttpStatus.BAD_GATEWAY, 7005, "Invalid response from GHN API."),
    SHIPMENT_CANNOT_CANCEL(HttpStatus.BAD_REQUEST, 7006, "Cannot cancel shipment in current status."),
    SHIPMENT_INVALID_STATUS(HttpStatus.BAD_REQUEST, 7007, "Invalid shipment status transition."),
    SHIPMENT_CANCEL_FAILED(HttpStatus.BAD_REQUEST, 5006, "Failed to cancel shipment"),
    INVALID_SHIPPING_ADDRESS(HttpStatus.BAD_REQUEST, 7008, "Invalid shipping address for shipment.");

    private final HttpStatus httpStatus;
    private final int code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, int code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }


}