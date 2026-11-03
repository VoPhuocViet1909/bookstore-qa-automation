package com.notfound.bookstore.service;

import java.util.UUID;

/**
 * Service quản lý timeout của các đơn hàng chờ thanh toán
 * Sử dụng Redis Key Expiration để tự động hủy đơn hàng khi quá hạn
 */
public interface OrderTimeoutService {

    /**
     * Lưu order timeout vào Redis với TTL (Time To Live)
     * @param orderId ID của order
     * @param timeoutMinutes Số phút trước khi timeout (mặc định 15 phút)
     */
    void scheduleOrderTimeout(UUID orderId, int timeoutMinutes);

    /**
     * Hủy timeout của order (khi thanh toán thành công)
     * @param orderId ID của order
     */
    void cancelOrderTimeout(UUID orderId);

    /**
     * Xử lý khi order timeout (được gọi tự động bởi Redis Event Listener)
     * @param orderId ID của order
     */
    void handleOrderTimeout(UUID orderId);

    /**
     * Kiểm tra xem order có đang trong trạng thái timeout không
     * @param orderId ID của order
     * @return true nếu order đang chờ timeout
     */
    boolean isOrderScheduledForTimeout(UUID orderId);
}

